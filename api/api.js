const express = require('express');
const fs = require('fs-extra');
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
    console.log(templateUrl);
    const downloadFileRequest = request(decodeURI(templateUrl));

    downloadFileRequest.on('response', function (res) {
        console.log('waiting to download');
        res.pipe(downloadZipFile);
        downloadZipFile.on('finish', function () {
            console.log('download finished');
            downloadZipFile.close();
            const readStream = fs.createReadStream(downloadZipFilePath);
            console.log(downloadZipFilePath);
            const unzippedTemplatePath = joinPaths(workingFolderName, downloadedZipFileID);
            fs.mkdirSync(unzippedTemplatePath);
            const writeStream = fstream.Writer(unzippedTemplatePath);
            readStream
                .pipe(unzip.Parse())
                .pipe(writeStream);
            console.log(unzippedTemplatePath);

            console.log('got here, error below');
            readStream.on('close', function (err) {

                console.log('closed readstream');
                fs.unlinkSync(downloadZipFilePath);
                for (let i = 0; i < fileEndings.length; i++) {
                    fileEndings[i] = fileEndings[i].replace('.', '');
                }
                setTimeout(() => {
                    renderFolder(variables, fileEndings, '', 0, targetArchive, unzippedTemplatePath, () => {
                        console.log('finalizing archive');
                        targetArchive.finalize();
                        fs.remove(workingFolderName)
                    });
                }, 500);
            });
        });
    });

}

router.get('/download-template', (req, res) => {
    // TODO: Handle possible rendering errors and pass error message to frontend
    console.log(req.query.request);
    console.log(decodeURIComponent(req.query.request));
    const requestData = JSON.parse(decodeURIComponent(req.query.request));
    console.log(JSON.stringify(requestData));
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=project.zip');

    let archive = new zipStream();

    archive.on('error', function (err) {
        console.log(err);
        throw err;
    });

    console.log('variables: ', requestData['variables']);
    console.log('fileEndings: ', requestData['fileEndings']);
    console.log('url: ', requestData.url);


    archive.pipe(res);
    renderTemplate(
        requestData.variables,
        requestData.fileEndings,
        archive,
        requestData.url
        // "https://firebasestorage.googleapis.com/v0/b/templyte.appspot.com/o/uploads%2Fusers%2Ff6mE2d1atWTzNM5aL59XzpInbxt2%2FtestTemplate.zip?alt=media&token=04a237d9-d579-4f4e-ac23-b699188e90b2"
    );
});

console.log('Exporting api router');
module.exports = router;