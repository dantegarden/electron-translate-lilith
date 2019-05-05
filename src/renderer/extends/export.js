var fs = require("fs")
var path = require("path")
var {shell} = require('electron')
const output = "output"

const writeToLocal = (novelName, chapterName, chapterObj) => new Promise((resolve, reject) => {
    let relativeFolderName = output + "/" + novelName ;
    let relativeFileName = relativeFolderName + "/" + chapterName + ".txt";
    mkdirs(relativeFolderName, () => {
        fs.exists(relativeFileName, function (exists) {
            if(exists){
                console.log("该文件已经存在");
                fs.unlinkSync(relativeFileName);
                console.log("文件已删除")
                writeLine(relativeFileName, chapterName)
                writeLine(relativeFileName, '')
            }

            chapterObj.sentences.forEach(sentence => {
                let line = sentence.textline
                if(sentence.type=='talk'){
                    line = sentence.speaker + "：" + line
                }
                writeLine(relativeFileName, line.trim())
            })
            console.log(path.resolve(relativeFileName))
            shell.openExternal(path.resolve(relativeFileName))
            resolve(true)

        })
    });

})

const writeLine = function(filePath, line){
    line += "\r\n"
    fs.writeFileSync(filePath, line, { 'flag': 'a' }, function(err) {
        if (err) {
            throw err;
        }
    });
}

const mkdirs = function (dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            //console.log(path.dirname(dirname));
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

export default {
    writeToLocal: writeToLocal
}