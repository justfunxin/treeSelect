treeSelect
==========

make a treeSelect use [bootstrap-treeview](https://jonmiles.github.io/bootstrap-treeview/)

1. support flat json data where `pid`
2. support select element, can config option by select `data-` attr
3. support dropdown select
4. when check a node, auto check all child nodes
5. when all sibling nodes checked, auto check parent node
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
### Options:
```javascript
$.fn.treeSelect.defaults = {
    data: [],
    dropdown: false,//dropdown select
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
