(function($) {
    var defaultOptions = {
        data: [],
        ignoreChildNode: true,
        showIcon: false,
        showTags: false,
        levels: 2,
        color: "#428bca",
        div: '<div class="select-tree"></div>',
        render: function($tree, $container) {
            if ($container.is('select')) {
                $container.hide();
                $container.after($tree);
            } else {
                $container.append($tree);
            }
        },
        onCheckChange: function(nodes, $tree, $container) {}
    };

    $.fn.treeSelect = function(options) {
        options = $.extend({}, defaultOptions, options);
        var $container = $(this);
        if ($container.is('select')) {
            options.data = createDataFromSelect($container);
        }
        initTreeSelect($container, options);
    };

    function initTreeSelect($container, options) {
        var $tree = $(options.div);
        $tree.treeview({
            data: createTreeDatas(options.data, 0),
            color: options.color,
            showIcon: options.showIcon,
            showTags: options.showTags,
            showCheckbox: true,
            levels: options.levels,
            onNodeChecked: function(event, node) {
                checkAllNodes($tree, "checkNode", node);
                onCheckChange(options, $tree, $container);
                event.stopPropagation();
            },
            onNodeUnchecked: function(event, node) {
                event.stopPropagation();
                checkAllNodes($tree, "uncheckNode", node);
                onCheckChange(options, $tree, $container);
                event.stopPropagation();
            }
        });
        options.render($tree, $container);
        onCheckChange(options, $tree, $container);
    }

    function onCheckChange(options, $tree, $container) {
        var checkedNodes = $tree.treeview('getChecked');
        var checkDatas = getCheckedDatas(checkedNodes, options.ignoreChildNode, options.data);
        if ($container.is('select')) {
            $container.find('option').removeAttr('selected');
            $(checkDatas).each(function(i, v) {
                $container.find('option[value="' + v.id + '"]').prop('selected', 'selected');
            });
        }
        if (typeof(options.onCheckChange) === 'function') {
            options.onCheckChange(checkDatas, $tree, $container);
        }
    }

    function getCheckedDatas(checkedNodes, ignoreChildNode, datas) {
        var checkedIds = checkedNodes.map(v => v.id);
        var checkDatas = datas.filter(data => checkedIds.includes(data.id));
        if (!ignoreChildNode) {
            return checkDatas;
        }
        var filterNodes = [];
        $(checkDatas).each(function(i, v) {
            if (v.pid === 0 || !checkedIds.includes(v.pid)) {
                filterNodes.push(v);
            }
        });
        return filterNodes;
    }

    function createDataFromSelect($select) {
        var datas = [];
        $select.find('option').each(function(i, v) {
            var option = $(this);
            datas.push({
                id: parseInt(option.attr('value')),
                text: option.text(),
                pid: option.data('pid') || 0,
                checked: option.is(':checked')
            })
        });
        return datas;
    }

    function createTreeDatas(datas, pid, idName, textName, pidName, checkedName, selectedName) {
        var treeDatas = [];
        var nodes = datas.filter(data => data[pidName || 'pid'] == pid)
        $(nodes).each(function(i, node) {
            var childDatas = createTreeDatas(datas, node[idName || 'id']);
            treeDatas.push({
                id: node[idName || 'id'],
                text: node[textName || 'text'],
                state: {
                    checked: node[checkedName || 'checked']
                },
                nodes: childDatas.length > 0 ? childDatas : undefined
            });
        });
        return treeDatas;
    }

    function checkAllNodes($tree, method, node) {
        checkAllChildNodes($tree, method, node);
        checkAllParentNodes($tree, method, node);
    }

    function checkAllParentNodes($tree, method, node) {
        if (node.parentId === undefined) {
            return;
        }
        var pnode = $tree.treeview('getNode', node.parentId);
        if ("checkNode" === method) {
            var arr = $tree.treeview('getSiblings', node);
            for (var i = 0; i < arr.length; i++) {
                var brotherNode = arr[i];
                if (!brotherNode.state.checked) {
                    return;
                }
            }
        }
        $tree.treeview(method, [node.parentId, {
            silent: true
        }]);
        checkAllParentNodes($tree, method, pnode);
    }

    function checkAllChildNodes($tree, method, node) {
        $(node.nodes).each(function(index, cnode) {
            $tree.treeview(method, [cnode.nodeId, {
                silent: true
            }]);
            if (cnode.nodes) {
                checkAllChildNodes($tree, method, cnode);
            }
        });
    }
})(jQuery);
