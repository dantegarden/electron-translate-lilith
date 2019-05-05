import $ from 'jquery'
import axios from 'axios'
import { MD5 } from '@/utils/md5'
var request = require('request')
import random from 'string-random'
import urlencode from 'urlencode'
import utf8 from 'utf8'

const baidu_appid = 'your appid'
const baidu_secretKey = 'your secretKey'
const baidu_translate = (text) => new Promise((resolve, reject) => {
  const salt = (new Date()).getTime()
  var str1 = baidu_appid + text + salt + baidu_secretKey
  var sign = MD5(str1)
  $.ajax({
    url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
    type: 'get',
    dataType: 'jsonp',
    data: {
      q: text,
      appid: baidu_appid,
      salt: salt,
      from: 'jp',
      to: 'zh',
      sign: sign
    },
    success: function(data) {
      if (data.trans_result && data.trans_result.length > 0) {
        resolve(data.trans_result[0].dst)
      }
    },
    error: function(err) {
      reject(err)
    }
  })
})

const caiyun_token = 'your token' // 临时
const caiyun_translate = (text) => new Promise((resolve, reject) => {
  const requestData = {
    source: [text],
    trans_type: 'ja2zh',
    request_id: 'demo'
  }
  request({
    url: 'http://api.interpreter.caiyunai.com/v1/translator', // 请求路径
    method: 'POST', // 请求方式，默认为get
    headers: {// 设置请求头
      'content-type': 'application/json',
      'X-Authorization': 'token ' + caiyun_token
    },
    body: JSON.stringify(requestData)// post参数字符串
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (body != null) {
        resolve(JSON.parse(body).target[0])
      }
    } else {
      reject(response)
    }
  })
})

const tencent_appid = 'your appid'
const tencent_appkey = 'your appkey'
const tencent_translate = (text) => new Promise((resolve, reject) => {
  const time_stamp = parseInt((new Date()).getTime() / 1000)
  const nonce_str = random(10)
  const param = {
    'app_id': tencent_appid,
    'nonce_str': nonce_str,
    'source': 'jp',
    'target': 'zh',
    'text': text,
    'time_stamp': time_stamp + ''
  }
  let before_sign = ''
  for (var key in param) {
    const value = param[key]
    before_sign += key + '=' + '' + encodeURI(value) + '&'
  }
  before_sign += 'app_key=' + tencent_appkey
  const sign = MD5(before_sign).toUpperCase()
  param.sign = sign
  request.post('https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate', // 请求路径
    {
      formData: param,
      json: true
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body != null && body.ret == 0) {
          resolve(body.data.target_text)
        }
      } else {
        reject(response)
      }
    })
})

export default {
  baidu: baidu_translate,
  tencent: tencent_translate,
  caiyun: caiyun_translate
}
