treeSelect
==========

### Useage:

```html
<div id="selectTree"></div>
```
```javascript
var data = [
    { id: 1, text: 'Node1', pid: 0, checked: true },
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
        var $selected = $('#selected');
        $selected.empty();
        $(nodes).each(function(i, v) {
            $selected.append('<div class="item">' + v.text + '</div>')
        });
    }
});
```
