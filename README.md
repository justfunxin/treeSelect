TreeSelect
==========

make a treeSelect use [bootstrap-treeview](https://jonmiles.github.io/bootstrap-treeview/)

1. support flat json data where `pid`
2. support select element, can config option by select `data-` attr
3. support `data-pid` or `data-section` type data
4. support `dropdown` select
5. when check a node, auto check all child nodes
6. when all sibling nodes checked, auto check parent node
### Demo
For demo, See http://kangarooxin.github.io/treeSelect

### Useage:
#### Demo1: read data from json
```html
<div id="selectTree"></div>
```
```javascript
var data = [
    { id: 1, text: 'Node1', pid: 0, checked: true, icon:"glyphicon glyphicon-stop", tags: ['tag1','tag2']},
    { id: 2, text: 'Node2', pid: 0 },
    { id: 3, text: 'Node3', pid: 0 },
    { id: 4, text: 'Node11', pid: 1, checked: true },
    { id: 5, text: 'Node12', pid: 1, checked: true },
    { id: 6, text: 'Node13', pid: 1, checked: true },
    { id: 7, text: 'Node21', pid: 2 },
    { id: 8, text: 'Node22', pid: 2 },
    { id: 9, text: 'Node111', pid: 4, checked: true },
    { id: 10, text: 'Node112', pid: 4, checked: true },
];
$('#selectTree').treeSelect({
    data: data,
    onCheckChange: function(nodes, $tree, $container) {
        
    }
});
```
#### Demo2: read data from a select
```html
<select id="selectTree2" multiple="multiple" data-show-icon="true" data-levels="1">
    <option value="1" data-pid="0" selected="selected" data-icon="glyphicon glyphicon-stop" data-tags="tag1,tag2">Node1</option>
    <option value="2" data-pid="0">Node2</option>
    <option value="3" data-pid="0">Node3</option>
    <option value="4" data-pid="1" selected="selected">Node11</option>
    <option value="5" data-pid="1" selected="selected">Node12</option>
    <option value="6" data-pid="1" selected="selected">Node13</option>
    <option value="7" data-pid="2">Node21</option>
    <option value="8" data-pid="2">Node22</option>
    <option value="9" data-pid="4" selected="selected">Node111</option>
    <option value="10" data-pid="4" selected="selected">Node112</option>
</select>
```
```javascript
$('#selectTree2').treeSelect();
```
#### Demo3: read data from a select, and display as a dropdown
```html
<select id="selectTree3" multiple="multiple" data-show-icon="true" data-levels="1" data-dropdown="true">
    <option value="1" data-pid="0" selected="selected" data-icon="glyphicon glyphicon-stop" data-tags="tag1,tag2">Node1</option>
    <option value="2" data-pid="0">Node2</option>
    <option value="3" data-pid="0">Node3</option>
    <option value="4" data-pid="1" selected="selected">Node11</option>
    <option value="5" data-pid="1" selected="selected">Node12</option>
    <option value="6" data-pid="1" selected="selected">Node13</option>
    <option value="7" data-pid="2">Node21</option>
    <option value="8" data-pid="2">Node22</option>
    <option value="9" data-pid="4" selected="selected">Node111</option>
    <option value="10" data-pid="4" selected="selected">Node112</option>
</select>
```
```javascript
$('#selectTree3').treeSelect();
```
#### Demo4: read data from a select, and use section delimiter instead of pid
```html
<select id="selectTree4" multiple="multiple" data-show-icon="true" data-levels="1" data-section="true">
    <option value="1" data-section="Node1" selected="selected" data-icon="glyphicon glyphicon-stop" data-tags="tag1,tag2">Node1</option>
    <option value="2" data-section="Node2">Node2</option>
    <option value="3" data-section="Node3">Node3</option>
    <option value="4" data-section="Node1:Node11" selected="selected">Node11</option>
    <option value="5" data-section="Node1:Node12" selected="selected">Node12</option>
    <option value="6" data-section="Node1:Node13" selected="selected">Node13</option>
    <option value="7" data-section="Node2:Node21">Node21</option>
    <option value="8" data-section="Node2:Node22">Node22</option>
    <option value="9" data-section="Node1:Node11:Node111" selected="selected">Node111</option>
    <option value="10" data-section="Node1:Node11:Node111" selected="selected">Node112</option>
</select>
```
```javascript
$('#selectTree4').treeSelect();
```
### Options:
```javascript
$.fn.treeSelect.defaults = {
    data: [],
    dropdown: false,//dropdown select
    section : false,//use section delimiter instead of pid
    sectionName: 'section',
    sectionDelimiter: ':',
    idName: 'id',
    pidName: 'pid',
    textName: 'text',
    iconName: 'icon',
    tagsName: 'tags',
    checkedName: 'checked',
    ignoreChildNode: true,//ignore child node when check parent node
    showIcon: true,
    showTags: true,
    levels: 2,//default expend level 2
    color: "#000",
    maxHeight: 0,
    div: '<div class="select-tree"></div>',
    dropdownEmptyText: '请选择...',
    getDropdownText: function(checkedDatas) {
        var checkedTexts = checkedDatas.map(function(value) {
            return value.text;
        });
        return checkedTexts.join(',');
    },
    onCheckChange: function (checkedDatas, $tree, $container) {
    }
};
```
