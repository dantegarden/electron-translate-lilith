<template>
    <div class="app-container">
        <el-row :gutter="20">
            <el-col :span="6">CH-{{chapterInfo.chapterNo}} {{chapterInfo.chapterName}}</el-col>
            <el-col :span="4" :offset="12">
                <el-button type="info" icon="el-icon-back" circle @click="$back"></el-button>
                <el-button v-if="!noSentenceFlag" type="warning" icon="el-icon-download" circle @click="exportChapter"></el-button>
            </el-col>

        </el-row>
        <div class="markdown-content">
            <template  v-for="(sentence, index) in tranSentenceList" >
                <template v-if="sentence.textline.indexOf('\r\n')>-1">
                    <el-row v-for="sentence_part in sentence.textline.split('\r\n')">
                        {{sentence_part}}
                    </el-row>
                </template>
                <el-row v-else>
                    <span v-if="sentence.type=='talk'" ><b>{{sentence.speaker}}:</b></span>
                    <span>{{sentence.textline}}</span>
                </el-row>
            </template>


        </div>
        <div v-if="noSentenceFlag">没有查询到翻译</div>
    </div>
</template>

<script>
    import { formatTime, parseTime } from '@/utils/index'
    import exportUtil from '@/extends/export.js'

    export default {
      data() {
        return {
          novelId: '',
          chapterId: '',
          novelInfo: {},
          chapterInfo: {},
          sentenceList: [],
          tranSentenceList: [],
          noSentenceFlag: false
        }
      },
      methods: {
        getNovelInfo() {
          var novelInfo = this.$db.get('novel')
              .find({ id: this.novelId }).value()
          this.novelInfo = novelInfo
        },
        getTranSentences() {
          this.getNovelInfo()
          var chapterInfo = this.$db.get('chapter')
            .find({ id: this.chapterId }).value()
          this.chapterInfo = chapterInfo
          var sentenceList = this.$db.get('raw_sentence')
            .filter({ chapterId: this.chapterId })
            .orderBy('updateTime').value()
          if (sentenceList) {
            this.sentenceList = sentenceList
            var tranSentenceList = []
            sentenceList.forEach(rawSentence => {
              const tranSentence = this.getTransSentenceByRawId(rawSentence.id)
              if (tranSentence && tranSentence.textline.trim()) {
                tranSentenceList.push(tranSentence)
              }
            })
            this.tranSentenceList = tranSentenceList
          } else {
            this.noSentenceFlag = true
          }
        },
        getTransSentenceByRawId(id) {
          return this.$db.get('trans_sentence')
            .find({ rawSentenceId: id }).value()
        },
        exportChapter(){
            let chapterObj = {
                chapter: this.chapterInfo,
                sentences: this.tranSentenceList
            }
            let chapterName = "CH-" + this.chapterInfo.chapterNo + this.chapterInfo.chapterName;
            exportUtil.writeToLocal(this.novelInfo.novelName,
                chapterName,
                chapterObj
            ).then(()=>{
                this.$message.success("导出完成")
            })
        }
      },
      created() {
        this.chapterId = this.$route.query.id
        this.novelId = this.$route.query.novelId
        this.getTranSentences()
    }
    }
</script>

<style scoped>
    .markdown-content {
        font-family: Open Sans,Clear Sans,Helvetica Neue,Helvetica,Arial,sans-serif;
        font-size: 16px;
        color: #333;
        line-height: 1.6;
        word-wrap: break-word;
        padding: 15px 0;
        background: #fff;
        border-radius: 0 0 3px 3px;
    }
    .markdown-content * {
        box-sizing: border-box;
    }
    .markdown-content>:first-child {
        margin-top: 0!important;
    }
</style>