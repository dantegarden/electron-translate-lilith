import Datastore from 'lowdb'
import LodashId from 'lodash-id'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'
import { remote, app } from 'electron'

if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
if (process.env.DEBUG_ENV === 'debug') {
    global.__static = path.join(__dirname, '../../static').replace(/\\/g, '\\\\')
}

const APP = process.type === 'renderer' ? remote.app : app
const STORE_PATH = APP.getPath('userData')

if (process.type !== 'renderer') {
    if (!fs.pathExistsSync(STORE_PATH)) {
        fs.mkdirpSync(STORE_PATH)
    }
}

const dataFilePath = path.join(STORE_PATH, '/data.json')
console.log(dataFilePath)
const adapter = new FileSync(dataFilePath)

const db = Datastore(adapter)
db._.mixin(LodashId)

//表结构
if (!db.has('novel').value()) {
    db.set('novel', []).write()
}
if (!db.has('chapter').value()) {
    db.set('chapter', []).write()
}
if (!db.has('raw_sentence').value()) {
    db.set('raw_sentence', []).write()
}
if (!db.has('trans_sentence').value()) {
    db.set('trans_sentence', []).write()
}

export default db