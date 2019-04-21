<template>
    <div class="app-container">
        <el-row :gutter="20">
            <el-col :span="6">CH-{{chapterInfo.chapterNo}} {{chapterInfo.chapterName}}</el-col>
            <el-col :span="4" :offset="12">
                <el-button type="info" icon="el-icon-back" circle @click="$back"></el-button>
            </el-col>

        </el-row>
        <div class="markdown-content">
            <p v-for="sentence in tranSentenceList" :key="sentence.id">
                <span v-if="sentence.type=='talk'" ><b>{{sentence.speaker}}:</b></span>
                <span>{{sentence.textline}}</span>
            </p>

        </div>
        <div v-if="noSentenceFlag">没有查询到翻译</div>
    </div>
</template>

<script>
    import {formatTime, parseTime} from '@/utils/index'

    export default {
        data() {
            return {
                novelId: '',
                chapterId: '',
                chapterInfo: {},
                sentenceList: [],
                tranSentenceList: [],
                noSentenceFlag: false,
            }
        },
        methods: {
            getTranSentences(){
                var chapterInfo = this.$db.get('chapter')
                    .find({id: this.chapterId}).value();
                this.chapterInfo = chapterInfo
                var sentenceList = this.$db.get('raw_sentence')
                    .filter({chapterId: this.chapterId})
                    .orderBy("updateTime").value();
                if(sentenceList){
                    this.sentenceList = sentenceList;
                    var tranSentenceList = []
                    sentenceList.forEach(rawSentence => {
                        let tranSentence = this.getTransSentenceByRawId(rawSentence.id)
                        if(tranSentence && tranSentence.textline.trim()){
                            tranSentenceList.push(tranSentence)
                        }
                    })
                    this.tranSentenceList = tranSentenceList
                }else{
                    this.noSentenceFlag = true;
                }
            },
            getTransSentenceByRawId(id){
                return this.$db.get('trans_sentence')
                    .find({rawSentenceId: id}).value()
            },
        },
        created(){
            this.chapterId = this.$route.query.id
            this.novelId = this.$route.query.novelId
            this.getTranSentences();
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