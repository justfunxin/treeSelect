(function ($) {
    $.fn.treeSelect = function (options) {
        options = $.extend({}, $.fn.treeSelect.defaults, options);
        var $treeSelect = new TreeSelect($(this), options);
        $treeSelect.init();
        return {
            reload: function reload(data) {
                $treeSelect.reload(data);
            },
            remove: function remove() {
                $treeSelect.remove();
            }
        };
    };

    var TreeSelect = function ($container, options) {
        this.$container = $container;
        this.options = options;
        if (this.$container.is('select')) {
            this.initSelectOption('dropdown');
            this.initSelectOption('ignoreChildNode');
            this.initSelectOption('showIcon');
            this.initSelectOption('showTags');
            this.initSelectOption('levels');
            this.initSelectOption('color');
            this.initSelectOption('maxHeight');
            this.initSelectOption('section');
            this.initSelectOption('sectionName');
            this.initSelectOption('sectionDelimiter');
            this.initSelectOption('firstLevelPid');
        }
    };

    TreeSelect.prototype.initSelectOption = function (name) {
        if(this.$container.data(name) !== undefined) {
            this.options[name] = this.$container.data(name);
        }
    };

    TreeSelect.prototype.init = function () {
        this.$tree = $(this.options.div);
        this.build();
        this.render();
        this.onCheckChange();
    };

    TreeSelect.prototype.build = function () {
        var _this = this;
        var $container = this.$container;
        var options = this.options;
        if ($container.is('select')) {
            if(options.section) {
                this.initSelectPid();
            }
            options.data = this.createDataFromSelect();
            options.flatData = true;
        }
        var data = options.data;
        if(options.flatData) {
            data = this.createTreeDatas(options.data, options.firstLevelPid);
        }

        this.$tree.treeview({
            data: data,
            color: options.color,
            showIcon: options.showIcon,
            showTags: options.showTags,
            showCheckbox: true,
            highlightSelected: false,
            levels: options.levels,
            onNodeChecked: function (event, node) {
                _this.checkAllNodes(node, 'checkNode');
                _this.onCheckChange();
                event.stopPropagation();
            },
            onNodeUnchecked: function (event, node) {
                _this.checkAllNodes(node, 'uncheckNode');
                _this.onCheckChange();
                event.stopPropagation();
            },
            onNodeSelected: function (event, node) {
                event.stopPropagation();
            },
            onNodeUnselected: function (event, node) {
                event.stopPropagation();
            }
        });
        if (options.maxHeight > 0) {
            this.$tree.css('max-height', options.maxHeight + 'px').css('overflow-y', 'scroll');
        }
        var checkedNodes = this.$tree.treeview('getChecked');
        $(checkedNodes).each(function (i, v) {
            _this.checkAllNodes(v, 'checkNode');
        });
    };

    TreeSelect.prototype.remove = function () {
        this.$tree.remove();
        if (this.$container.is('select')) {
            this.$container.show();
        }
    };

    TreeSelect.prototype.reload = function (data) {
        this.$tree.remove();
        this.options = $.extend({}, this.options, {
            data: data
        });
        this.build();
        this.render();
        this.onCheckChange();
    };

    TreeSelect.prototype.render = function () {
        var $div;
        if(this.options.dropdown) {
            this.$tree.addClass('dropdown-menu').css('border', 'none').css('padding', '0');
            var $dropdown = $('<div class="dropdown dropdown-tree"></div>');
            var $dropdownBtn = $('<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="dropdown-tree-text">' + this.options.dropdownEmptyText + '</span><span class="caret"></span></button>')
            this.$dropdownText = $dropdownBtn.find('.dropdown-tree-text');
            $dropdown.append($dropdownBtn).append(this.$tree)
            $div = $dropdown;
        } else {
            $div = this.$tree;
        }
        if (this.$container.is('select')) {
            this.$container.hide();
            this.$container.after($div);
        } else {
            this.$container.append($div);
        }
    };

    TreeSelect.prototype.checkAllNodes = function (node, method) {
        var childNodeIds = this.getAllChildNodes(node);
        var parentNodeIds = this.getAllAffectParentNodes(node, method);
        var nodeIds = [];
        if(this.options.autoCheckChildNode) {
            nodeIds = nodeIds.concat(childNodeIds);
        }
        if(this.options.autoCheckParentNode) {
            nodeIds = nodeIds.concat(parentNodeIds);
        }
        if(nodeIds.length > 0) {
            this.$tree.treeview(method, [nodeIds, {
                silent: true
            }]);
        }
    };

    TreeSelect.prototype.isAllSiblingsChecked = function(node) {
        var arr = this.$tree.treeview('getSiblings', node);
        for (var i = 0; i < arr.length; i++) {
            var brotherNode = arr[i];
            if (!brotherNode.state.checked) {
                return false;
            }
        }
        return true;
    };

    TreeSelect.prototype.getAllAffectParentNodes = function(node, method) {
        var ids = [];
        if(node.parentId !== undefined) {
            if("uncheckNode" === method || ("checkNode" === method && this.isAllSiblingsChecked(node))) {
                var parentNode = this.$tree.treeview('getNode', node.parentId);
                ids.push(node.parentId);
                ids = ids.concat(this.getAllAffectParentNodes(parentNode, method));
            }
        }
        return ids;
    };

    TreeSelect.prototype.getAllChildNodes = function(node) {
        var _this = this;
        var ids = [];
        $(node.nodes).each(function(index, childNode) {
            ids.push(childNode.nodeId);
            ids = ids.concat(_this.getAllChildNodes(childNode));
        });
        return ids;
    };

    TreeSelect.prototype.onCheckChange = function () {
        var _this = this;
        var checkDatas = this.getCheckedDatas();
        if (this.$container.is('select')) {
            this.$container.find('option').removeAttr('selected');
            $(checkDatas).each(function (i, v) {
                _this.$container.find('option[value="' + v.id + '"]').prop('selected', 'selected');
            });
        }
        if(this.options.dropdown) {
            if(checkDatas.length === 0) {
                this.$dropdownText.html(this.options.dropdownEmptyText);
            } else {
                this.$dropdownText.html(this.options.getDropdownText(checkDatas));
            }
        }
        if (typeof (this.options.onCheckChange) === 'function') {
            this.options.onCheckChange(checkDatas, this.$tree, this.$container);
        }
    };

    TreeSelect.prototype.getCheckedDatas = function () {
        var checkedNodes = this.$tree.treeview('getChecked');
        var checkedIds = checkedNodes.map(function(value) {
            return value.id;
        });
        var checkDatas = this.options.data.filter(function(value) {
            return checkedIds.includes(value.id);
        });
        if (!this.options.ignoreChildNode) {
            return checkDatas;
        }
        var filterNodes = [];
        $(checkDatas).each(function (i, v) {
            if (v.pid === 0 || !checkedIds.includes(v.pid)) {
                filterNodes.push(v);
            }
        });
        return filterNodes;
    };

    TreeSelect.prototype.initSelectPid = function() {
        var _this = this;
        var _sectionName = _this.options.sectionName;
        var _sectionDelimiter = _this.options.sectionDelimiter;
        this.$container.find('option').each(function (i, v) {
            var section = $(this).data(_sectionName);
            if(section.lastIndexOf(_sectionDelimiter) > 0) {
                section = section.substring(0, section.lastIndexOf(_sectionDelimiter));
                var pnode = _this.$container.find('option[data-' + _sectionName + '="' + section + '"]');
                if(pnode.length > 0) {
                    $(this).attr('data-pid', pnode.attr('value'));
                } else {
                    $(this).attr('data-pid', _this.options.firstLevelPid);
                }
            } else {
                $(this).attr('data-pid', _this.options.firstLevelPid);
            }
        });
    };

    TreeSelect.prototype.createDataFromSelect = function () {
        var datas = [];
        var _this = this;
        this.$container.find('option').each(function (i, v) {
            var option = $(this);
            var tags = _this.escapeHtml(option.data('tags'));
            if (tags) {
                tags = tags.split(',');
            }
            datas.push({
                id: option.attr('value'),
                text: option.html(),
                pid: option.attr('data-pid'),
                checked: option.is(':checked'),
                icon: option.attr('data-icon'),
                tags: tags
            })
        });
        return datas;
    };

    TreeSelect.prototype.escapeHtml = function(content) {
        var $div = $('<div/>');
        $div.text(content);
        return $div.html();
    };

    TreeSelect.prototype.createTreeDatas = function (datas, pid) {
        var _this = this;
        var treeDatas = [];
        var nodes = datas.filter(function(value){
            return value[_this.options.pidName] == pid;
        });
        $(nodes).each(function (i, node) {
            var childDatas = _this.createTreeDatas(datas, node.id);
            treeDatas.push({
                id: node[_this.options.idName],
                text: node[_this.options.textName],
                icon: node[_this.options.iconName],
                tags: node[_this.options.tagsName],
                state: {
                    checked: node[_this.options.checkedName]
                },
                nodes: childDatas.length > 0 ? childDatas : undefined
            });
        });
        return treeDatas;
    };

    $.fn.treeSelect.defaults = {
        data: [],
        flatData: true,//扁平json数据，使用pid指定父节点
        dropdown: false,//下拉选择框
        dropdownEmptyText: '请选择...',//下拉选择框不选择时显示的内容
        section : false,//不使用pid，使用分级节点和分隔符构建父子节点
        sectionName: 'section', //分级节点名称
        sectionDelimiter: ':',  //分级节点分隔符
        idName: 'id',
        pidName: 'pid',
        textName: 'text',
        iconName: 'icon',
        tagsName: 'tags',
        checkedName: 'checked',
        autoCheckChildNode: true,//选中节点时自动选中所有子节点
        autoCheckParentNode: true, //兄弟节点都被选中时，自动选中父节点
        ignoreChildNode: true,//选中父节点时上报事件中忽略子节点
        showIcon: true,//显示图标
        showTags: true,//显示标签
        levels: 2,//默认展开2层
        color: "#000", //文字颜色
        maxHeight: 0,  //框体最大高度，0不限制
        div: '<div class="select-tree"></div>',
        getDropdownText: function(checkedDatas) {//下拉选择框选中后展示内容
            var checkedTexts = checkedDatas.map(function(value) {
                return value.text;
            });
            return checkedTexts.join(',');
        },
        onCheckChange: function (checkedDatas, $tree, $container) {
        }
    };
})(jQuery);
