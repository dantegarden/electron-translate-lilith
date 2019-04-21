const speakerTransMap = [
  { source_name: '室井', trans_name: '室井' },
  { source_name: '浩介', trans_name: '浩介' },
  { source_name: 'アサギ', trans_name: '阿莎姬' },
  { source_name: 'さくら', trans_name: '樱' },
  { source_name: '紫', trans_name: '紫' },
  { source_name: 'アスカ', trans_name: '明日香' },
  { source_name: 'ゆきかぜ', trans_name: '雪风' },
  { source_name: '凜子', trans_name: '凛子' },
  { source_name: '静流', trans_name: '静流' },
  { source_name: '胧', trans_name: '胧' },
  { source_name: '男', trans_name: '男人' },
  { source_name: '女', trans_name: '女人' }
]

export const transSpeakerName = source_name => {
  var f = speakerTransMap.find(s => s.source_name == source_name)
  if (f) {
    return f.trans_name
  }
  return source_name
}
