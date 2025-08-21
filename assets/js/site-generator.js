const fs = require("fs");
const path = require("path");

/**
 * Borra una carpeta y todo su contenido.
 */
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
    } catch (err) {
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
    }
  }
}

/**
 * Copia un archivo de src a dest, creando carpetas si es necesario.
 */
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * Genera el sitio estático personalizado.
 * - Limpia la carpeta de salida antes de generar.
 * - Copia solo los archivos necesarios.
 */
function generateSite({ templateName, data, outputDir }) {
  try {
    // 1. LIMPIA LA CARPETA DE SALIDA SI YA EXISTE
    if (fs.existsSync(outputDir)) {
      deleteFolderRecursive(outputDir);
    }

    // 2. GENERA EL HTML
    const templatePath = path.join("templates", `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`No existe el archivo de plantilla: ${templatePath}`);
    }
    let templateHtml = fs.readFileSync(templatePath, "utf-8");

    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      templateHtml = templateHtml.replace(regex, data[key]);
    });

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "index.html"), templateHtml);

    // 3. COPIA LOS CSS NECESARIOS
    const cssOutputDir = path.join(outputDir, "css");
    fs.mkdirSync(cssOutputDir, { recursive: true });

    // Copia animations.css
    const animSrc = path.join("templates", "css", "animations.css");
    if (!fs.existsSync(animSrc)) throw new Error(`No existe: ${animSrc}`);
    copyFile(animSrc, path.join(cssOutputDir, "animations.css"));

    // Copia el css del template
    const cssSrc = path.join("templates", "css", `${templateName}.css`);
    if (!fs.existsSync(cssSrc)) throw new Error(`No existe: ${cssSrc}`);
    copyFile(cssSrc, path.join(cssOutputDir, `${templateName}.css`));

    return true;
  } catch (err) {
    console.error("Error en generateSite:", err);
    throw err;
  }
}

module.exports = {
  generateSite,
};