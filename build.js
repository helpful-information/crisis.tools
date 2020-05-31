const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();
const { render } = require('mustache');
const findAllFiles = (dir) => fs
    .readdirSync(dir)
    .reduce(
        (files, file) =>
            fs.statSync(path.join(dir, file)).isDirectory()
                ? files.concat(findAllFiles(path.join(dir, file)))
                : files.concat(path.join(dir, file)),
        []
    );



const markdownFiles = findAllFiles(__dirname).filter(file => file.endsWith('.md') && !file.includes('node_modules')).map(file => file.replace(__dirname, ''));

const routeMap = {
    "/README.md": "/",
    "/code-of-conduct.md": "/code-of-conduct",
    "/contributing.md": "/contributing"
};

const renderFileAndFormat = (filePath) => {
    const content = md.render(fs.readFileSync(__dirname + filePath, {
        encoding: "utf-8"
    }));


    return render(fs.readFileSync(__dirname + '/templates/layout.html', { encoding: 'utf-8' }), {
        title: 'Important information for a crisis in one spot',
        description: 'Life is hard, and when bad things happen it can be difficult to know where to move next. This is a collection of resources that might make deciding what to do a little easier.',
        content,
    })
}
for (let filePath in routeMap) {
    const output = renderFileAndFormat(filePath);
    const outputDirectory = routeMap[filePath];

    if (!fs.existsSync(__dirname + '/docs' + outputDirectory)) {
        fs.mkdirSync(__dirname + '/docs' + outputDirectory)
    }

    fs.writeFileSync(__dirname + '/docs' + outputDirectory + '/index.html', output)
}

console.log('Built the documentation!');
