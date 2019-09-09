<template>
    <div class="app-container">
        <el-row>
            <el-form ref="form" :model="formdata">
                <el-form-item>
                    <el-input type="textarea"
                          :autosize="{ minRows: 2, maxRows:20}"
                        placeholder="请输入原文内容"
                          v-model="formdata.rawText"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">提交</el-button>
                    <el-button @click="onReset">重置</el-button>
                    <el-button @click="onCancel">取消</el-button>
                </el-form-item>
            </el-form>
        </el-row>
    </div>
</template>

<script>
    import { formatTime, parseTime } from '@/utils/index'
    import regexUtil from '@/extends/regex'

    export default {
      data() {
        return {
          novelId: '',
          chapterId: '',
          formdata: {
            rawText: ''
          }
        }
      },
      methods: {
        onSubmit(e) {
          if (this.formdata.rawText.trim()) {
            const content = this.formdata.rawText
            // 全文正则过滤非法字符
            const texts = regexUtil.parse(content)
            // const reg1 = /(\[NAME_TIPS_OFF\]\\|\[NAME_\w n="([^\]]+?)"\]\\)([\w\W]*?)(?=\[T_NEXT\]\\)/g
            // const reg2 = /(\[NAME_TIPS_OFF\]\\|\[NAME_\w n="([^\]]+?)"\]\\)([\w\W]*?)/
            // const reg1Arr = content.match(reg1)
            // reg1Arr.forEach(reg1Text => {
            //   var reg2Text = reg1Text.replace(reg2, '$2$3')
            //   texts.push(reg2Text)
            // })
            this.createRawSentece(texts)
          }
        },
        createRawSentece(texts) {
          if (texts.length > 0) {
            try {
              texts.forEach(text => {
                const rawSentence = {
                  updateTime: parseTime(new Date()),
                  chapterId: this.chapterId
                }

                if (text.startsWith('\n')) {
                  text = text.substr(1).replace('\n', '').trim()
                  rawSentence.type = 'state'
                  rawSentence.textline = text
                } else {
                  const textArr = text.split('\n')
                  rawSentence.speaker = textArr[0]
                  rawSentence.type = 'talk'
                  rawSentence.textline = textArr.splice(1).join('')
                }

                this.$db.get('raw_sentence')
                  .insert(rawSentence)
                  .write()
              })

              this.updateChapterInfo(texts.length)
            } catch (err) {
              this.$message.error('提交失败，自动回滚')
              this.$db.get('raw_sentence')
                .remove({ chapterId: this.chapterId })
                .write()
            }
          }
        },
        updateChapterInfo(sentenceCounter) {
          let savedRawSentenceNum = this.$db.get('chapter').find({ id: this.chapterId }).value()['rawSentenceNum']
          this.$db.get('chapter')
            .find({ id: this.chapterId })
            .assign({ rawSentenceNum: savedRawSentenceNum + sentenceCounter,
              workONRow: 1 })
            .write()
          savedRawSentenceNum = this.$db.get('novel').find({ id: this.novelId }).value()['rawSentenceNum']
          this.$db.get('novel')
            .find({ id: this.novelId })
            .assign({ rawSentenceNum: savedRawSentenceNum + sentenceCounter })
            .write()
        },
        onCancel(e) {
          this.$back()
        },
        onReset(e) { // 重置表单
          this.$nextTick(() => {
            this.formdata.rawText = ''
          })
        }
      },
      created() {
        this.chapterId = this.$route.query.id
        this.novelId = this.$route.query.novelId
      }
    }
</script>

<style scoped>

</style>