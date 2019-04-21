<template>
    <div class="app-container">
        <el-row :gutter="20">
            <el-col :span="6">CH-{{chapterInfo.chapterNo}} {{chapterInfo.chapterName}}</el-col>
            <el-col :span="4" :offset="12">
                <el-button type="info" icon="el-icon-back" circle @click="$back"></el-button>
            </el-col>

        </el-row>
        <div class="markdown-content">
            <p v-for="sentence in sentenceList" :key="sentence.id">
                <span v-if="sentence.type=='talk'" ><b>{{sentence.speaker}}:</b></span>
                <span>{{sentence.textline}}</span>
            </p>

        </div>
        <div v-if="noSentenceFlag">没有查询到原文</div>
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
                noSentenceFlag: false,
            }
        },
        methods: {
            getSentences(){
                var chapterInfo = this.$db.get('chapter')
                    .find({id: this.chapterId}).value();
                this.chapterInfo = chapterInfo
                var sentenceList = this.$db.get('raw_sentence')
                    .filter({chapterId: this.chapterId})
                    .orderBy("updateTime").value();
                if(sentenceList){
                    this.sentenceList = sentenceList;
                }else{
                    this.noSentenceFlag = true;
                }
            }
        },
        created(){
            this.chapterId = this.$route.query.id
            this.novelId = this.$route.query.novelId
            this.getSentences();
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