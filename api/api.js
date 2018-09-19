const express = require('express');
const zipStream = require('zip-stream');
const admZip = require('adm-zip');
const fs = require('fs');
const pathUtils = require('path');
const uuidv1 = require('uuid/v1');

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
    console.log(templateUrl);
    const tempFolderPath = joinPaths('.', tempFolderName);
    makeDirIfNotExists(tempFolderPath);
    let workingFolderName = joinPaths(tempFolderPath, uuidv1());
    while (fs.existsSync(workingFolderName)) {
        workingFolderName = joinPaths(tempFolderPath, uuidv1());
    }
    fs.mkdirSync(workingFolderName);
    console.log(workingFolderName);
    renderFolder(variables, fileEndings, targetArchive);
    targetArchive.finalize();
    deleteDir(workingFolderName);
}

router.get('/download-template', (req, res) => {
    // TODO: switch to post request, replace placeholder info with post request info

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=project.zip');

    let archive = new zipStream();

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(res);

    renderTemplate({
            'myVar1': 'SOME_VAL',
            'myOtherVar': 'SOME_OTHER_VAL'
        },
        ['txt'],
        archive,
        '"https://firebasestorage.googleapis.com/v0/b/templyte.appspot.com/o/uploads%2Fusers%2Ff6mE2d1atWTzNM5aL59XzpInbxt2%2FtestTemplate.zip?alt=media&token=36e8aa70-6c58-458b-898d-0be85975ddab"'
    );
});

console.log('Exporting api router');
module.exports = router;