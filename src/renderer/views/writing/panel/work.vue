<template>
    <div class="app-container">
        <el-row :gutter="20" class="large-panel">
            <el-col :span="12">
                <div class="markdown-content" style="height:250px; overflow:hidden;">
                    <p v-for="sentence in displayRaw" :key="sentence.id" :class="sentence.current?'current':''">
                        <span v-if="sentence.type=='talk'" ><b>{{sentence.speaker}}:</b></span>
                        <span>{{sentence.textline}}</span>
                    </p>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="markdown-content" style="height:250px; overflow:hidden;">
                    <p v-for="sentence in displayTran" :key="sentence.id" :class="sentence.current?'current':''">
                        <span v-if="sentence.type=='talk'" ><b>{{sentence.speaker}}:</b></span>
                        <span>{{sentence.textline}}</span>
                    </p>
                </div>
            </el-col>
        </el-row>
        <el-row class="large-panel">
            <div class="markdown-content" style="margin-top:15px;">
                <el-form ref="form" >
                    <el-form-item>
                        <el-input placeholder="原文" v-model="currentRawText" readonly>
                            <template slot="prepend">原文</template>
                            <template slot="append" >
                                <el-button slot="append" type="primary" @click="dialogFormVisible = true">
                                    {{chapterInfo.workONRow}}/{{chapterInfo.rawSentenceNum}}
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input placeholder="腾讯" clearable v-model="TencentText">
                            <template slot="prepend">腾讯</template>
                            <template slot="append">
                                <el-button slot="append" type="primary"  @click="useTranslate('tencent')">采用</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input placeholder="彩云" clearable v-model="CaiyunText">
                            <template slot="prepend">彩云</template>
                            <template slot="append">
                                <el-button slot="append" type="primary" @click="useTranslate('caiyun')">采用</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-input
                                        type="textarea"
                                        :autosize="{ minRows: 4, maxRows: 5}"
                                        placeholder="请输入内容"
                                        v-model="MyText">
                                </el-input>
                            </el-col>
                            <el-col :span="4">
                                <el-row>
                                    <el-button-group>
                                        <el-button type="success" size="small" round @click="previousRow">上一条</el-button>
                                        <el-button type="danger"  size="small" round @click="nextRow">下一条</el-button>
                                    </el-button-group>
                                </el-row>
                                <el-row>
                                    <el-button type="primary" size="small" @click="useTranslate('mine')" round>用我的</el-button>
                                    <el-button type="warning" size="small" @click="viewTrans" round>预览</el-button>
                                </el-row>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
            </div>
        </el-row>

        <el-dialog title="跳转到句子" :visible.sync="dialogFormVisible" width="75%">
            <el-form class="small-space"  label-position="left" label-width="200px"
                     style='width: 100%; margin-left:50px;'>
                <el-form-item label="原句编号" required>
                    <el-input-number v-model="chapterInfo.workONRow" :min="1" :max="chapterInfo.rawSentenceNum"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="success" @click="jumpToRow">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import translate from '@/extends/translate'
    import { transSpeakerName } from '@/utils/localDict'
    import { formatTime, parseTime } from '@/utils/index'
    import random from 'string-random'

    export default {
      data() {
        return {
          novelId: '',
          chapterId: '',

          displayRaw: [],
          displayTran: [],

          rawSentenceList: [],
          sentenceList: [],

          currentRawText: '',
          BaiduText: '',
          TencentText: '',
          CaiyunText: '',
          MyText: '',
          usedMark: false,

          currentStep: 4,
          currentRawRow: {},
          chapterInfo: {},
          novelInfo: {},
          dialogFormVisible: false

        }
      },
      methods: {
        init() {
          this.getNovelInfo()
          this.getChapterInfo()
          this.getRawSentenceList()
        },
        getNovelInfo() {
          var novelInfo = this.$db.get('novel')
            .find({ id: this.novelId }).value()
          this.novelInfo = novelInfo
        },
        getChapterInfo() {
          var chapterInfo = this.$db.get('chapter')
            .find({ id: this.chapterId }).value()
          this.chapterInfo = chapterInfo
        },
        getRawSentenceList() {
          var sentenceList = this.$db.get('raw_sentence')
            .filter({ chapterId: this.chapterId })
            .orderBy('updateTime').value()
          if (sentenceList) {
            this.rawSentenceList = sentenceList
            this.freshRawDisplay()
            this.freshWorkBench()
          }
        },
        freshRawDisplay() {
          var displayRaws = []
          var displayTrans = []
          var workOnRowIndex = this.chapterInfo.workONRow - 1
          if (this.chapterInfo.workONRow > this.currentStep) {
            var startIndex = this.chapterInfo.workONRow - this.currentStep
            var endIndex = this.chapterInfo.workONRow + this.currentStep
            endIndex = (this.rawSentenceList.length > endIndex)?endIndex: this.rawSentenceList.length-1
            while (startIndex <= endIndex) {
              const cloneSentence = Object.assign({}, this.rawSentenceList[startIndex])
              if (startIndex === workOnRowIndex) {
                cloneSentence.current = true
              }
                displayRaws.push(cloneSentence)

                let transSentence = this.getTransSentenceByRawId(cloneSentence.id)
                if (transSentence) {
                  transSentence = Object.assign({}, transSentence)
                } else {
                  transSentence = { textline: '', id: random(16) }
                }
                if (cloneSentence.current) { transSentence.current = true }
                displayTrans.push(transSentence)

                startIndex++
            }
          } else {
            var startIndex = 0
            while (startIndex < this.currentStep * 2) {
              const cloneSentence = Object.assign({}, this.rawSentenceList[startIndex])
              if (startIndex === workOnRowIndex) {
                cloneSentence.current = true
              }
              displayRaws.push(cloneSentence)

              let transSentence = this.getTransSentenceByRawId(cloneSentence.id)
              if (transSentence) {
                transSentence = Object.assign({}, transSentence)
              } else {
                transSentence = { textline: '', id: random(16) }
              }
              if (cloneSentence.current) { transSentence.current = true }
              displayTrans.push(transSentence)

              startIndex++
            }
          }
          this.displayRaw = displayRaws
          this.displayTran = displayTrans
        },
        freshWorkBench() {
          const currentRow = this.displayRaw.find(r => r.current)
          if(currentRow){
              this.currentRawRow = currentRow
              this.currentRawText = currentRow.textline
              this.translate(currentRow.textline)
              const old_tran_sentence = this.$db.get('trans_sentence')
                  .find({ rawSentenceId: currentRow.id }).value()
              if (!old_tran_sentence) {
                  this.MyText = ''
              } else {
                  this.MyText = old_tran_sentence.textline
              }
              this.usedMark = false;
          }
        },
        translate(text) {
          // translate.baidu(text).then(dst => {
          //     this.BaiduText = dst
          // })
          translate.caiyun(text).then(dst => {
            this.CaiyunText = dst
          })
          translate.tencent(text).then(dst => {
            this.TencentText = dst
          })
        },
        useTranslate(source){
          var text = ''
          if (source == 'tencent') {
              text = this.TencentText
          } else if (source == 'caiyun') {
              text = this.CaiyunText
          } else if (source == 'mine') {
              text = this.MyText
          }

          this.useText(text)
        },
        checkTypeTextline(text){
            if(text){
                const currentRaw = this.currentRawRow
                text = text.replace(/\s*/g,"").replace("...", '...').replace("!", "！").replace("?", "？").replace(/\"/g,""); //去除空格
                if(currentRaw.textline.startsWith("「")){
                    if(text.startsWith("“") && !text.endsWith("”")) text += "”";
                    else if(!text.startsWith("“") && text.endsWith("”")) text = "“"+text;
                    else if(!text.startsWith("“") && !text.endsWith("”")) text ="“" + text +  "”";
                }
                if(currentRaw.textline.startsWith("（")){
                    if(text.startsWith("（") && !text.endsWith("）")) text += "）";
                    else if(!text.startsWith("（") && text.endsWith("）")) text = "（"+text;
                    else if(!text.startsWith("（") && !text.endsWith("）")) text ="（" + text +  "）";
                }
            }
            return text
        },
        useText(text) {
          const currentRaw = this.currentRawRow
          currentRaw.type == 'talk' ? (text = this.checkTypeTextline(text)) : null;
          text = text.indexOf("\n")>-1?text.replace("\n","\r\n"):text;
          const old_tran_sentence = this.$db.get('trans_sentence')
            .find({ rawSentenceId: currentRaw.id }).value()
          if (!old_tran_sentence) {
            const tran_sentence = {
              chapterId: currentRaw.chapterId,
              rawSentenceId: currentRaw.id,
              type: currentRaw.type,
              textline: text,
              updateTime: parseTime(new Date())
            }
            if (tran_sentence.type == 'talk') { tran_sentence.speaker = transSpeakerName(currentRaw.speaker) }
            tran_sentence.wordsNum = (tran_sentence.speaker ? tran_sentence.speaker.length : 0) + tran_sentence.textline.length
            this.addTranSentence(tran_sentence)
          } else {
            old_tran_sentence.textline = text
            if (old_tran_sentence.type == 'talk') { old_tran_sentence.speaker = transSpeakerName(currentRaw.speaker) }
            const oldWordsNum = old_tran_sentence.wordsNum
            old_tran_sentence.wordsNum = (old_tran_sentence.speaker ? old_tran_sentence.speaker.length : 0) + old_tran_sentence.textline.length
            this.updateTranSentence(old_tran_sentence, oldWordsNum)
          }
          this.usedMark = true
          this.freshRawDisplay()
        },
        addTranSentence(sentence) { // 新增翻译句子
          this.$db.get('trans_sentence')
            .insert(sentence)
            .write()
          this.chapterInfo.sentenceNum += 1
          this.chapterInfo.wordsNum += sentence.wordsNum
          this.$db.get('chapter')
            .find({ id: this.chapterId })
            .assign({ sentenceNum: this.chapterInfo.sentenceNum,
              wordsNum: this.chapterInfo.wordsNum,
              workONRow: this.chapterInfo.workONRow,
              updateTime: parseTime(new Date()) })
            .write()
          this.novelInfo.sentenceNum += 1
          this.novelInfo.wordsNum += sentence.wordsNum
          this.$db.get('novel')
            .find({ id: this.novelId })
            .assign({ sentenceNum: this.novelInfo.sentenceNum,
              wordsNum: this.novelInfo.wordsNum,
              updateTime: parseTime(new Date()) })
            .write()
        },
        updateTranSentence(sentence, oldWordsNum) { // 更新翻译句子
          // 先删再查
          this.$db.get('trans_sentence')
            .remove({ id: sentence.id })
            .write()
          this.chapterInfo.sentenceNum -= 1
          this.chapterInfo.wordsNum -= oldWordsNum
          this.$db.get('chapter')
            .find({ id: this.chapterId })
            .assign({ sentenceNum: this.chapterInfo.sentenceNum,
              wordsNum: this.chapterInfo.wordsNum,
              updateTime: parseTime(new Date()) })
            .write()
          this.novelInfo.sentenceNum -= 1
          this.novelInfo.wordsNum -= oldWordsNum
          this.$db.get('novel')
            .find({ id: this.novelId })
            .assign({ sentenceNum: this.novelInfo.sentenceNum,
              wordsNum: this.novelInfo.wordsNum,
              updateTime: parseTime(new Date()) })
            .write()
          this.addTranSentence(sentence)
        },
        getTransSentenceByRawId(id) {
          return this.$db.get('trans_sentence')
            .find({ rawSentenceId: id }).value()
        },
        nextRow() {
          if(this.rawSentenceList.length==this.chapterInfo.workONRow){this.$message.warning('到底啦！'); return;}
          if(!this.usedMark && this.MyText){
            this.useText(this.MyText)
          }
          this.chapterInfo.workONRow++
          this.freshRawDisplay()
          this.freshWorkBench()
        },
        previousRow() {
          if(1==this.chapterInfo.workONRow){this.$message.warning('到顶啦！'); return;}
          if(!this.usedMark && this.MyText){
            this.useText(this.MyText)
            this.usedMark = true
          }
          this.chapterInfo.workONRow--
          this.freshRawDisplay()
          this.freshWorkBench()
        },
        jumpToRow() {
          this.freshRawDisplay()
          this.freshWorkBench()
          this.dialogFormVisible = false
        },
        viewTrans(e) {
          this.$router.push({ path: '/writing/viewTrans', query: { id: this.chapterId, novelId: this.novelId }})
        },
        back(e) {
          this.$back()
        }
      },
      created() {
        this.chapterId = this.$route.query.id
        this.novelId = this.$route.query.novelId
        this.init()
    }
    }
</script>

<style scoped>
    .markdown-content {
        font-family: Open Sans,Clear Sans,Helvetica Neue,Helvetica,Arial,sans-serif;
        font-size: 14px;
        color: #333;
        line-height: 1;
        word-wrap: break-word;
        padding: 2px 0;
        background: #fff;
        border-radius: 0 0 3px 3px;
    }
    .current{
        color: red
    }
</style>