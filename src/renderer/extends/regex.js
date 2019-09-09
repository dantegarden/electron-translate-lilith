var reg_starts = ['[NAME_TIPS_OFF]\\', '[NAME_W n="人名"]\\', '[NAME_M n="人名"]\\']
var reg_ends = ["[T_NEXT]\\"];

//预处理文本头部标签并生成正则字符串
for(let i=0; i< reg_starts.length; i++) {
    if (reg_starts[i].indexOf("\\") != -1) reg_starts[i] = reg_starts[i].replace("\\", "\\\\");
    if (reg_starts[i].indexOf("[") != -1) reg_starts[i] = reg_starts[i].replace("[", "\\[");
    if (reg_starts[i].indexOf("]") != -1) reg_starts[i] = reg_starts[i].replace("]", "\\]");
    if (reg_starts[i].indexOf('"') != -1) reg_starts[i] = reg_starts[i].replace(/"(.+?)"/, '"([^\\]]+?)"');
    console.log(reg_starts[i]);
}
var startsStr="("+reg_starts.join("|")+")";

for(let i=0; i< reg_ends.length; i++) {
    if(reg_ends[i].indexOf("\\")!=-1)reg_ends[i]=reg_ends[i].replace("\\","\\\\");
    if(reg_ends[i].indexOf("[")!=-1)reg_ends[i]=reg_ends[i].replace("[","\\[");
    if(reg_ends[i].indexOf("]")!=-1)reg_ends[i]=reg_ends[i].replace("]","\\]");
    console.log(reg_ends[i]);
}
//预处理文本尾部标签并生成正则字符串
var endsStr="(?="+reg_ends.join("|")+")";

//拼装正则
var cutInReg="【[^】]*?】"//匹配转场描述
var exRegGroup=[];	//新增正则规则组
exRegGroup.push(cutInReg);
//匹配所有姓名和台词
var regGetNameAndDiaList = startsStr+"([\\w\\W]*?)"+endsStr;
//添加额外匹配规则
var regGetNameAndDiaAndCutInList = regGetNameAndDiaList+"|"+exRegGroup.join("|");

export default {
    parse: function(text){
        //匹配所有姓名、台词和转场描述
        var nameAndDiaAndCutInList = text.match(new RegExp(regGetNameAndDiaAndCutInList,'g'));
        //$2捕获角色名，$3捕获台词或旁白，用于拼装并格式化姓名和台词
        var regGetNameAndDia='(\\[.*?"([^\\]]+?)".*?\\]\\\\|\\[.*?\\]\\\\)([\\w\\W]*)'		//$2捕获角色名，$3捕获台词或旁白
        //格式化
        var parsedTexts = []
        for(let i=0;  i<nameAndDiaAndCutInList.length;i++){
            //若为转场描述，则不做任何处理
            if(nameAndDiaAndCutInList[i].match(new RegExp(cutInReg)))continue;
            //否则进行格式化
            parsedTexts.push(nameAndDiaAndCutInList[i].replace(new RegExp(regGetNameAndDia),'$2$3'));
        }
        return parsedTexts;
    }
}
