<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form :inline="true" :model="queryCondition"  size="mini">
                <el-form-item label="章节名称">
                    <el-input v-model="queryCondition.chapterName" placeholder="章节名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button-group>
                        <el-button type="primary" icon="el-icon-refresh" @click="getChapterList"></el-button>
                        <el-button type="primary" icon="search" @click="query">查询</el-button>
                        <el-button type="success" @click.native="add">新增</el-button>
                    </el-button-group>
                    <el-button type="default" @click.native="$back" >返回</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table :data="chapterList" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
            <el-table-column label="章节号" width="65">
                <template slot-scope="scope">
                    {{scope.row.chapterNo}}
                </template>
            </el-table-column>
            <el-table-column label="章节名称" width="170">
                <template slot-scope="scope">
                    {{scope.row.chapterName}}
                </template>
            </el-table-column>
            <el-table-column label="原文句数"  width="110" align="center">
                <template slot-scope="scope">
                    {{scope.row.rawSentenceNum}}
                </template>
            </el-table-column>
            <el-table-column label="译文句数" width="110" align="center">
                <template slot-scope="scope">
                    {{scope.row.sentenceNum}}
                </template>
            </el-table-column>
            <el-table-column label="译文总字数"  width="110" align="center">
                <template slot-scope="scope">
                    {{scope.row.wordsNum}}
                </template>
            </el-table-column>
            <el-table-column label="最近更新时间" width="170" align="center">
                <template slot-scope="scope">
                    {{scope.row.updateTime}}
                </template>
            </el-table-column>
            <el-table-column align="center"  label="操作"  fixed="right">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button type="success" icon="edit"
                                   @click="addRaw(scope.row.id)">导入原文</el-button>
                        <el-button type="warning" icon="edit"
                                   @click="viewRaw(scope.row.id)">查看原文</el-button>
                        <el-button type="primary" icon="edit"
                                   @click="work(scope.row.id)">翻译</el-button>
                        <el-button type="danger" icon="delete"
                                   @click="remove(scope.row.id)">删除</el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="新增章节" :visible.sync="dialogFormVisible" width="75%">
            <el-form class="small-space" :model="tempChapter" label-position="left" label-width="200px"
                     style='width: 100%; margin-left:50px;'>
                <el-form-item label="章节名称" required>
                    <el-input type="text" v-model="tempChapter.chapterName" style="width: 250px;"></el-input>
                </el-form-item>
                <el-form-item label="章节号" required>
                    <el-input-number v-model="tempChapter.chapterNo" :min="1" :max="999"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="success" @click="createChapter">创 建</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { formatTime, parseTime } from '@/utils/index'
    export default {
      data() {
        return {
          novelId: '',
          chapterList: [],
          listLoading: true,
          queryCondition: {
            chapterName: ''
          },
          dialogFormVisible: false,
          tempChapter: {
            chapterNo: 0,
            chapterName: '',
            rawSentenceNum: 0,
            sentenceNum: 0,
            wordsNum: 0,
            workONRow: 0, // 目前进行到第几句（下一个要完成句子的编号）
            updateTime: '',
            novelId: ''

          }
        }
      },
      methods: {
        getChapterList() {
          this.listLoading = true
          const cond = this.queryCondition.chapterName ? this.queryCondition : {}
          cond.novelId = this.novelId
          const list = this.$db.get('chapter')
            .filter(cond).sortBy('chapterNo')
            .value()
          if (list) {
            this.chapterList = list
          }
          this.listLoading = false
        },
        query() {
          this.getChapterList()
        },
        add() {
          this.tempChapter.chapterName = ''
          this.tempChapter.chapterNo = 1
          this.dialogFormVisible = true
        },
        createChapter() {
          this.tempChapter.updateTime = parseTime(new Date())
          this.$db.get('chapter')
            .insert(this.tempChapter)
            .write()
          let novelInfo = this.$db.get('novel').find({ id: this.novelId }).value()
          this.$db.get('novel').find({ id: this.novelId }).assign({
              chapterNum: novelInfo.chapterNum + 1,
              updateTime: parseTime(new Date()) })
            .write()
          this.dialogFormVisible = false
          this.getChapterList()
        },
        addRaw(id) {
          this.$router.push({ path: '/writing/addRaw', query: { id: id, novelId: this.novelId }})
        },
        viewRaw(id) {
          this.$router.push({ path: '/writing/viewRaw', query: { id: id, novelId: this.novelId }})
        },
        work(id) {
          this.$router.push({ path: '/writing/work', query: { id: id, novelId: this.novelId }})
        },
        remove(id) {
          this.$confirm('确定删除此章节?', '提示', {
            confirmButtonText: '确定',
            showCancelButton: false,
            type: 'warning'
          }).then(() => {
            this.$db.get('chapter')
              .remove({ id: id })
              .write()
            let novelInfo = this.$db.get('novel').find({ id: this.novelId }).value()
            this.$db.get('novel').find({ id: this.novelId }).assign({
              chapterNum: novelInfo.chapterNum - 1,
              updateTime: parseTime(new Date()) })
              .write()
            this.getChapterList()
            this.$message.success('删除成功')
          })
        }
      },
      created: function() {
        this.novelId = this.$route.query.id
        this.tempChapter.novelId = this.novelId
      },
      mounted: function() {
        this.getChapterList()
      }
    }
</script>

<style scoped>

</style>