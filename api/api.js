const express = require('express');
const fs = require('fs');
const fstream = require('fstream');
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


function renderFolder(variables, fileEndings, path, targetArchive) {

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
                renderFolder(variables, fileEndings, unzippedTemplatePath, targetArchive);
                targetArchive.finalize();
                // deleteDir(workingFolderName);
            });
        });
    });

}

router.get('/download-template', (req, res) => {
    // TODO: switch to post request if unable to pass all required information through get request

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