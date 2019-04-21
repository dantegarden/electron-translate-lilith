<template>
    <div class="app-container">
        <div class="filter-container">
            <el-form :inline="true" :model="queryCondition"  size="mini">
                <el-form-item label="作品名称">
                    <el-input v-model="queryCondition.novelName" placeholder="作品名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button-group>
                        <el-button type="primary" icon="el-icon-refresh" @click="getNovelList"></el-button>
                        <el-button type="primary" icon="search" @click="query">查询</el-button>
                        <el-button type="success" @click.native="add">新增</el-button>
                    </el-button-group>
                </el-form-item>
            </el-form>
        </div>

        <el-table :data="novelList" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
            <el-table-column label="作品名称">
                <template slot-scope="scope">
                    {{scope.row.novelName}}
                </template>
            </el-table-column>
            <el-table-column label="原文章节数" width="110" align="center">
                <template slot-scope="scope">
                    <span>{{scope.row.rawChapterNum}}</span>
                </template>
            </el-table-column>
            <el-table-column label="译文章节数" width="110" align="center">
                <template slot-scope="scope">
                    {{scope.row.chapterNum}}
                </template>
            </el-table-column>
            <el-table-column label="原文句数"  align="center">
                <template slot-scope="scope">
                    {{scope.row.rawSentenceNum}}
                </template>
            </el-table-column>
            <el-table-column label="译文句数"  align="center">
                <template slot-scope="scope">
                    {{scope.row.sentenceNum}}
                </template>
            </el-table-column>
            <el-table-column label="译文总字数"  align="center">
                <template slot-scope="scope">
                    {{scope.row.wordsNum}}
                </template>
            </el-table-column>
            <el-table-column label="最近更新时间" width="170" align="center">
                <template slot-scope="scope">
                    {{scope.row.updateTime}}
                </template>
            </el-table-column>
            <el-table-column align="center"  label="操作" width="200" fixed="right">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button type="primary" icon="edit"
                                   @click="update(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="delete"
                                   @click="remove(scope.row.id)">删除</el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="新增作品" :visible.sync="dialogFormVisible" width="75%">
            <el-form class="small-space" :model="tempNovel" label-position="left" label-width="200px"
                     style='width: 100%; margin-left:50px;'>
                <el-form-item label="作品名称" required>
                    <el-input type="text" v-model="tempNovel.novelName" style="width: 250px;"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="success" @click="createNovel">创 建</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {formatTime, parseTime} from '@/utils/index'
    export default {
        data() {
            return {
                novelList: null,
                listLoading: true,
                queryCondition: {
                    novelName : '',
                },
                dialogFormVisible: false,
                tempNovel: {
                    novelName: '',
                    rawChapterNum: 0,
                    chapterNum: 0,
                    rawSentenceNum: 0,
                    sentenceNum: 0,
                    wordsNum: 0,
                    updateTime: ''
                }
            }
        },
        created() {
            this.getNovelList()
        },
        methods: {
            getNovelList(){
                this.listLoading = true;
                let cond = this.queryCondition.novelName? this.queryCondition: {}
                let list = this.$db.get('novel')
                    .filter(cond).sortBy('updateTime')
                    .value()
                if(list){
                    this.novelList = list;
                }
                this.listLoading = false;
            },
            query(){
                this.getNovelList()
            },
            add(){
                this.tempNovel.novelName = '';
                this.dialogFormVisible = true
            },
            createNovel(){
                this.tempNovel.updateTime = parseTime(new Date());
                this.$db.get('novel')
                    .insert(this.tempNovel)
                    .write()
                this.dialogFormVisible = false
                this.getNovelList()
            },
            update(id){
                this.$router.push({path:"/writing/chapter", query:{id: id}})
            },
            remove(id){
                this.$confirm('确定删除此作品?', '提示', {
                    confirmButtonText: '确定',
                    showCancelButton: false,
                    type: 'warning'
                }).then(() => {
                    this.$db.get('novel')
                        .remove({id:id})
                        .write()
                    this.getNovelList();
                    this.$message.success("删除成功");
                })
            }
        }
    }
</script>
