const express = require('express');
const fs = require('fs');
const fstream = require('fstream');
const mustache = require('mustache');
const pathUtils = require('path');
const request = require('request');
const unzip = require('unzip');
const uuidv1 = require('uuid/v1');
const zipStream = require('zip-stream');

const joinPaths = pathUtils.join;
const tempFolderName = 'temp';

console.log('Running api.js');

const router = express.Router();

function deleteDir(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = joinPaths(dirPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            deleteDir(filePath)
        } else {
            fs.unlinkSync(filePath);
        }
    });
    fs.rmdirSync(dirPath);
}

function makeDirIfNotExists(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}


function renderFolder(variableMap, targetFileEndings, path, index, targetArchive, templateBasePath, doneCallback) {
    const targetPath = joinPaths(templateBasePath, path);
    fs.readdir(targetPath, (err, files) => {
        if (index < files.length) {
            let fileName = files[index];
            const relativeFilePath = joinPaths(path, fileName);
            const fullFilePath = joinPaths(targetPath, fileName);
            if (fs.lstatSync(fullFilePath).isDirectory()) {
                renderFolder(variableMap, targetFileEndings, relativeFilePath, 0, targetArchive, templateBasePath, doneCallback)
            } else {
                const fileContents = fs.readFileSync(fullFilePath);
                const fileExtension = fullFilePath.split('.').slice(-1)[0];
                const output = targetFileEndings.indexOf(fileExtension) < 0 ? fileContents : mustache.render(fileContents.toString(), variableMap);
                targetArchive.entry(output, {name: relativeFilePath}, function () {
                    renderFolder(variableMap, targetFileEndings, path, index + 1, targetArchive, templateBasePath, doneCallback)
                });
            }
        } else {
            doneCallback();
        }
    });
}

function renderTemplate(variables, fileEndings, targetArchive, templateUrl) {
    const tempFolderPath = joinPaths('.', tempFolderName);
    makeDirIfNotExists(tempFolderPath);

    let workingFolderName = joinPaths(tempFolderPath, uuidv1());
    while (fs.existsSync(workingFolderName)) {
        workingFolderName = joinPaths(tempFolderPath, uuidv1());
    }
    fs.mkdirSync(workingFolderName);

    const downloadedZipFileID = 'rawTemplate';
    const downloadedZipFileName = downloadedZipFileID + '.zip';
    const downloadZipFilePath = joinPaths(workingFolderName, downloadedZipFileName);
    const downloadZipFile = fs.createWriteStream(downloadZipFilePath);
    const downloadFileRequest = request(templateUrl);

    downloadFileRequest.on('response', function (res) {
        res.pipe(downloadZipFile);
        downloadZipFile.on('finish', function () {
            downloadZipFile.close();

            const readStream = fs.createReadStream(downloadZipFilePath);
            const unzippedTemplatePath = joinPaths(workingFolderName, downloadedZipFileID);
            fs.mkdirSync(unzippedTemplatePath);
            const writeStream = fstream.Writer(unzippedTemplatePath);

            readStream
                .pipe(unzip.Parse())
                .pipe(writeStream);

            readStream.on('close', function () {
                fs.unlinkSync(downloadZipFilePath);
                for (let i = 0; i < fileEndings.length; i++) {
                    fileEndings[i] = fileEndings[i].replace('.', '');
                }
                setTimeout(() => {
                    renderFolder(variables, fileEndings, '', 0, targetArchive, unzippedTemplatePath, () => {
                        targetArchive.finalize();
                        deleteDir(workingFolderName);
                    });
                }, 500);
            });
        });
    });

}

router.get('/download-template', (req, res) => {
    // TODO: Switch to post request if unable to pass all required information through get request
    // TODO: Handle possible rendering errors and pass error message to frontend

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=project.zip');

    let archive = new zipStream();

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(res);

    // TODO: replace placeholder info with request info
    renderTemplate({
            'myVar1': 'SOME_VAL',
            'myOtherVar': 'SOME_OTHER_VAL'
        },
        ['txt'],
        archive,
        'https://firebasestorage.googleapis.com/v0/b/templyte.appspot.com/o/uploads%2Fusers%2Ff6mE2d1atWTzNM5aL59XzpInbxt2%2FtestTemplate.zip?alt=media&token=36e8aa70-6c58-458b-898d-0be85975ddab'
    );
});

console.log('Exporting api router');
module.exports = router;