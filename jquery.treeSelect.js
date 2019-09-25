;(function ($, window, document, undefined) {

    var pluginName = 'treeSelect';

    $.fn[pluginName] = function (options, args) {

        var result;

        this.each(function () {
            var _this = $.data(this, pluginName);
            if (typeof options === 'string') {
                if (!_this) {
                    logError('Not initialized, can not call method : ' + options);
                }
                else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
                    logError('No such method : ' + options);
                }
                else {
                    if (!(args instanceof Array)) {
                        args = [ args ];
                    }
                    result = _this[options].apply(_this, args);
                }
            }
            else if (typeof options === 'boolean') {
                result = _this;
            }
            else {
                $.data(this, pluginName, new TreeSelect(this, $.extend({}, $.fn.treeSelect.defaults, options)));
            }
        });

        return result || this;
    };

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    var TreeSelect = function (container, options) {
        this.$container = $(container);
        this.init(options);
        return {
            remove: $.proxy(this.remove, this),
            reload: $.proxy(this.reload, this),
            checkAll: $.proxy(this.checkAll, this),
            uncheckAll: $.proxy(this.uncheckAll, this),
        }
    };

    TreeSelect.prototype.init = function (options) {
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
            this.initSelectOption('searchable');
            this.initSelectOption('searchIgnoreCase');
            this.initSelectOption('searchExactMatch');
            this.initSelectOption('onlyLeafSelectable');
            this.initSelectOption('autoCheckChildNode');
            this.initSelectOption('autoCheckParentNode');
        }
        this.$treeSelect = $(this.options.div);
        this.$search = this.$treeSelect.find('.tree-select-search');
        this.$tree = this.$treeSelect.find('.tree-select-view');
        this.build();
        this.render();
        this.initSearch();
        this.onCheckChange();
    };

    TreeSelect.prototype.initSelectOption = function (name) {
        if (this.$container.data(name) !== undefined) {
            this.options[name] = this.$container.data(name);
        }
    };

    TreeSelect.prototype.build = function () {
        var _this = this;
        var $container = this.$container;
        var options = this.options;
        if ($container.is('select')) {
            options.data = this.createDataFromSelect();
            options.flatData = true;
            options.multiple = typeof( $container.attr("multiple")) != "undefined";
        }
        var data = options.data;
        if (options.flatData) {
            if (options.section) {
                this.initPidFromSection(data);
            }
            data = this.createTreeDatas(data, options.firstLevelPid);
        }

        this.$tree.treeview({
            data: data,
            color: options.color,
            showIcon: options.showIcon,
            showTags: options.showTags,
            showCheckbox: true,
            onlyLeafSelectable: options.onlyLeafSelectable,
            highlightSelected: false,
            levels: options.levels,
            onNodeChecked: function (event, node) {
                if (_this.options.multiple) {
                    _this.checkAllNodes(node, 'checkNode');
                } else {
                    _this.uncheckOtherNodes(node);
                }
                _this.onCheckChange();
                event.stopPropagation();
            },
            onNodeUnchecked: function (event, node) {
                if (_this.options.multiple) {
                    _this.checkAllNodes(node, 'uncheckNode');
                }
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
            this.$tree.css('max-height', options.maxHeight + 'px').css('overflow-y', 'auto');
        }
        if (options.multiple && !options.onlyLeafSelectable) {
            var checkedNodes = this.$tree.treeview('getChecked');
            $(checkedNodes).each(function (i, v) {
                _this.checkAllNodes(v, 'checkNode');
            });
        }
    };

    TreeSelect.prototype.initSearch = function() {
        var _this = this;
        if(!this.options.searchable) {
            this.$search.hide();
            return;
        }
        var searchOptions = {
            ignoreCase: this.options.searchIgnoreCase,
            exactMatch:  this.options.searchExactMatch,
            revealResults: true
        };
        var $searchInput = this.$search.find('input');
        var $searchClear = this.$search.find('.tree-select-search-clear');
        $searchInput.on('keyup', function(){
            var pattern = $(this).val();
            var results = _this.$tree.treeview('search', [ pattern, searchOptions ]);
            if (typeof (_this.options.onSearchResult()) === 'function') {
                _this.options.onSearchResult(_this.nodeToData(results), _this.$treeSelect, _this.$container);
            }
        });
        $searchClear.click(function(){
            _this.$tree.treeview('clearSearch');
            $searchInput.val('');
            return false;
        });
    };

    TreeSelect.prototype.remove = function () {
        $.removeData(this, pluginName);
        this.$treeSelect.remove();
        this.$tree.empty();
        if (this.$container.is('select')) {
            this.$container.show();
        }
    };

    TreeSelect.prototype.reload = function (data) {
        this.$treeSelect.remove();
        this.$tree.empty();
        this.options = $.extend({}, this.options, {
            data: data
        });
        this.build();
        this.render();
        this.initSearch();
        this.onCheckChange();
    };

    TreeSelect.prototype.uncheckAll = function () {
        this.$tree.treeview('uncheckAll', {
            silent: true
        });
        this.onCheckChange();
    };

    TreeSelect.prototype.checkAll = function () {
        this.$tree.treeview('checkAll', {
            silent: true
        });
        this.onCheckChange();
    };

    TreeSelect.prototype.render = function () {
        var $div;
        if (this.options.dropdown) {
            this.$treeSelect.addClass('dropdown-menu').css('border', 'none').css('padding', '0');
            var $dropdown = $('<div class="dropdown dropdown-tree"></div>');
            var $dropdownBtn = $('<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="dropdown-tree-text">' + this.options.dropdownEmptyText + '</span><span class="caret"></span></button>')
            this.$dropdownText = $dropdownBtn.find('.dropdown-tree-text');
            $dropdown.append($dropdownBtn).append(this.$treeSelect)
            $div = $dropdown;
        } else {
            $div = this.$treeSelect;
        }
        if (this.$container.is('select')) {
            this.$container.hide();
            this.$container.after($div);
        } else {
            this.$container.append($div);
        }
    };

    TreeSelect.prototype.uncheckOtherNodes = function (node) {
        var checkedNodes = this.$tree.treeview('getChecked');
        var checkedNodeIds = checkedNodes.map(function (value) {
            return value.nodeId;
        });
        var index = checkedNodeIds.indexOf(node.nodeId);
        checkedNodeIds.splice(index, 1);
        if (checkedNodeIds.length > 0) {
            this.$tree.treeview('uncheckNode', [checkedNodeIds, {
                silent: true
            }]);
        }
    };

    TreeSelect.prototype.checkAllNodes = function (node, method) {
        var childNodeIds = this.getAllChildNodes(node);
        var parentNodeIds = this.getAllAffectParentNodes(node, method);
        var nodeIds = [];
        if (this.options.autoCheckChildNode) {
            nodeIds = nodeIds.concat(childNodeIds);
        }
        if (this.options.autoCheckParentNode) {
            nodeIds = nodeIds.concat(parentNodeIds);
        }
        if (nodeIds.length > 0) {
            this.$tree.treeview(method, [nodeIds, {
                silent: true
            }]);
        }
    };

    TreeSelect.prototype.isAllSiblingsChecked = function (node) {
        var arr = this.$tree.treeview('getSiblings', node);
        for (var i = 0; i < arr.length; i++) {
            var brotherNode = arr[i];
            if (!brotherNode.state.checked) {
                return false;
            }
        }
        return true;
    };

    TreeSelect.prototype.getAllAffectParentNodes = function (node, method) {
        var ids = [];
        if (node.parentId !== undefined) {
            if ("uncheckNode" === method || ("checkNode" === method && this.isAllSiblingsChecked(node))) {
                var parentNode = this.$tree.treeview('getNode', node.parentId);
                ids.push(node.parentId);
                ids = ids.concat(this.getAllAffectParentNodes(parentNode, method));
            }
        }
        return ids;
    };

    TreeSelect.prototype.getAllChildNodes = function (node) {
        var _this = this;
        var ids = [];
        $(node.nodes).each(function (index, childNode) {
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
        if (this.options.dropdown) {
            if (checkDatas.length === 0) {
                this.$dropdownText.html(this.options.dropdownEmptyText);
            } else {
                this.$dropdownText.html(this.options.getDropdownText(checkDatas));
            }
        }
        if (typeof (this.options.onCheckChange) === 'function') {
            this.options.onCheckChange(checkDatas, this.$treeSelect, this.$container);
        }
    };

    TreeSelect.prototype.getCheckedDatas = function () {
        var checkedNodes = this.$tree.treeview('getChecked');
        var checkDatas = this.nodeToData(checkedNodes);
        if (!this.options.ignoreChildNode) {
            return checkDatas;
        }
        var checkedDataIds = checkedNodes.map(function (value) {
            return value.id;
        });
        var filterDatas = [];
        $(checkDatas).each(function (i, v) {
            if (v.pid === 0 || !checkedDataIds.includes(v.pid)) {
                filterDatas.push(v);
            }
        });
        return filterDatas;
    };

    TreeSelect.prototype.nodeToData = function(nodes) {
        var dataIds = nodes.map(function (value) {
            return value.id;
        });
        return this.options.data.filter(function (value) {
            return dataIds.includes(value.id);
        });
    };

    TreeSelect.prototype.initPidFromSection = function (datas) {
        var _this = this;
        var _sectionName = _this.options.sectionName;
        var _pidName = _this.options.pidName;
        var _idName = _this.options.idName;
        var _sectionDelimiter = _this.options.sectionDelimiter;
        $(datas).each(function (i, v) {
            var pid = _this.options.firstLevelPid;
            var section = v[_sectionName];
            if (section.lastIndexOf(_sectionDelimiter) > 0) {
                section = section.substring(0, section.lastIndexOf(_sectionDelimiter));
                var pnode = datas.filter(function (data) {
                    return data[_sectionName] == section;
                });
                if (pnode.length > 0) {
                    pid = pnode[0][_idName];
                }
            }
            v[_pidName] = pid;
        });
    };

    TreeSelect.prototype.createDataFromSelect = function () {
        var datas = [];
        var _this = this;
        this.$container.find('option').each(function (i, v) {
            var option = $(this);
            var tags = _this.escapeHtml(option.attr('data-' + _this.options.tagsName));
            if (tags) {
                tags = tags.split(',');
            }
            var data = {};
            data[_this.options.idName] = option.attr('value');
            data[_this.options.textName] = option.html();
            data[_this.options.pidName] = option.attr('data-' + _this.options.pidName);
            data[_this.options.sectionName] = option.attr('data-' + _this.options.sectionName);
            data[_this.options.checkedName] = option.is(':checked');
            data[_this.options.iconName] = option.attr('data-' + _this.options.iconName);
            data[_this.options.tagsName] = tags;
            datas.push(data);
        });
        return datas;
    };

    TreeSelect.prototype.escapeHtml = function (content) {
        var $div = $('<div/>');
        $div.text(content);
        return $div.html();
    };

    TreeSelect.prototype.createTreeDatas = function (datas, pid) {
        var _this = this;
        var treeDatas = [];
        var nodes = datas.filter(function (value) {
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
        section: false,//不使用pid，使用分级节点和分隔符构建父子节点
        sectionName: 'section', //分级节点名称
        sectionDelimiter: ':',  //分级节点分隔符
        searchable: true, //可以搜索
        searchIgnoreCase: true, //搜索忽略大小写
        searchExactMatch: false, //搜索全匹配
        idName: 'id',
        pidName: 'pid',
        textName: 'text',
        iconName: 'icon',
        tagsName: 'tags',
        checkedName: 'checked',
        multiple: true, //多选
        onlyLeafSelectable: false, //仅可选中叶子节点
        autoCheckChildNode: true,//选中节点时自动选中所有子节点
        autoCheckParentNode: true, //兄弟节点都被选中时，自动选中父节点
        ignoreChildNode: true,//选中父节点时上报事件中忽略子节点
        showIcon: true,//显示图标
        showTags: true,//显示标签
        levels: 2,//默认展开2层
        color: "#000", //文字颜色
        maxHeight: 0,  //框体最大高度，0不限制
        div: '<div class="tree-select">' +
            '   <div class="tree-select-search">' +
            '       <input type="text" class="form-control" placeholder="Type to search...">' +
            '       <span class="glyphicon glyphicon-remove tree-select-search-clear"></span>' +
            '   </div>' +
            '   <div class="tree-select-view"></div>' +
            '</div>',
        getDropdownText: function (checkedDatas) {//下拉选择框选中后展示内容
            var checkedTexts = checkedDatas.map(function (value) {
                return value.text;
            });
            return checkedTexts.join(',');
        },
        onCheckChange: function (checkedDatas, $treeSelect, $container) {
        },
        onSearchResult: function(searchResultDatas, $treeSelect, $container) {
        }
    };
})(jQuery, window, document);
