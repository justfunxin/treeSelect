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
            options.data = this.createDataFromSelect();
        }
        this.$tree.treeview({
            data: this.createTreeDatas(options.data, 0),
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
            _this.checkAllChildNodes(v, 'checkNode');
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
        this.checkAllChildNodes(node, method);
        this.checkAllParentNodes(node, method);
    };

    TreeSelect.prototype.checkAllParentNodes = function (node, method) {
        if (node.parentId === undefined) {
            return;
        }
        if ("checkNode" === method) {
            var arr = this.$tree.treeview('getSiblings', node);
            for (var i = 0; i < arr.length; i++) {
                var brotherNode = arr[i];
                if (!brotherNode.state.checked) {
                    return;
                }
            }
        }
        this.$tree.treeview(method, [node.parentId, {
            silent: true
        }]);
        var pnode = this.$tree.treeview('getNode', node.parentId);
        this.checkAllParentNodes(pnode, method);
    };

    TreeSelect.prototype.checkAllChildNodes = function (node, method) {
        var _this = this;
        $(node.nodes).each(function (index, cnode) {
            _this.$tree.treeview(method, [cnode.nodeId, {
                silent: true
            }]);
            if (cnode.nodes) {
                _this.checkAllChildNodes(cnode, method);
            }
        });
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

    TreeSelect.prototype.createDataFromSelect = function () {
        var datas = [];
        this.$container.find('option').each(function (i, v) {
            var option = $(this);
            var tags = option.data('tags');
            if (tags) {
                tags = tags.split(',');
            }
            datas.push({
                id: parseInt(option.attr('value')),
                text: option.text(),
                pid: option.data('pid') || 0,
                checked: option.is(':checked'),
                icon: option.data('icon'),
                tags: tags
            })
        });
        return datas;
    };

    TreeSelect.prototype.createTreeDatas = function (datas, pid) {
        var _this = this;
        var treeDatas = [];
        var nodes = datas.filter(function(value){
            return value[_this.options.pidName] === pid;
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
        dropdown: false,
        idName: 'id',
        pidName: 'pid',
        textName: 'text',
        iconName: 'icon',
        tagsName: 'tags',
        checkedName: 'checked',
        ignoreChildNode: true,
        showIcon: true,
        showTags: true,
        levels: 2,
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
})(jQuery);
