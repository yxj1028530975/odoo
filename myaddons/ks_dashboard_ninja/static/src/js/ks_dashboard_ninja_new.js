/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, onWillStart, useState ,onMounted,onWillRender, useRef, useEffect, onWillPatch, onWillUpdateProps } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { useSetupAction } from "@web/webclient/actions/action_hook";
import { localization } from "@web/core/l10n/localization";
import { browser } from '@web/core/browser/browser';
import { strftimeToLuxonFormat } from "@web/core/l10n/dates";
import { session } from "@web/session";
import { download } from "@web/core/network/download";
import { BlockUI } from "@web/core/ui/block_ui";
import { WebClient } from "@web/webclient/webclient";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { patch } from "@web/core/utils/patch";
import { isBrowserChrome, isMobileOS } from "@web/core/browser/feature_detection";
import { loadBundle } from '@web/core/assets';
import {globalfunction } from '@ks_dashboard_ninja/js/ks_global_functions'
import { Ksdashboardtile } from '@ks_dashboard_ninja/components/ks_dashboard_tile_view/ks_dashboard_tile';
import { Ksdashboardlistview } from '@ks_dashboard_ninja/components/ks_dashboard_list_view/ks_dashboard_list';
import { Ksdashboardtodo } from '@ks_dashboard_ninja/components/ks_dashboard_to_do_item/ks_dashboard_to_do';
import { Ksdashboardkpiview } from '@ks_dashboard_ninja/components/ks_dashboard_kpi_view/ks_dashboard_kpi';
import { Ksdashboardgraph } from '@ks_dashboard_ninja/components/ks_dashboard_graphs/ks_dashboard_graphs';


export class KsDashboardNinja extends Component {

    setup() {
        this.actionService = useService("action");
        this.dialogService = useService("dialog");
        this.notification = useService("notification");
        this._rpc = useService("rpc");
        this.dialogService = useService("dialog");
        this.header =  useRef("ks_dashboard_header");
        this.main_body = useRef("ks_main_body");
        this.reload_menu_option = {
            reload:this.props.action.context.ks_reload_menu,
            menu_id: this.props.action.context.ks_menu_id
        };
        this.ks_mode = 'active';
        this.action_manager = parent;
//      this.controllerID = params.controllerID;
        this.name = "ks_dashboard";
        this.ksIsDashboardManager = false;
        this.ksDashboardEditMode = false;
        this.ksNewDashboardName = false;
        this.file_type_magic_word = {
            '/': 'jpg',
            'R': 'gif',
            'i': 'png',
            'P': 'svg+xml',
        };
        this.ksAllowItemClick = true;

        //Dn Filters Iitialization

        this.date_format = localization.dateFormat
        //        this.date_format = this.date_format.replace(/\bYY\b/g, "YYYY");
        this.datetime_format = localization.dateTimeFormat
        //            this.is_dateFilter_rendered = false;
        this.ks_date_filter_data;

        // Adding date filter selection options in dictionary format : {'id':{'days':1,'text':"Text to show"}}
        this.ks_date_filter_selections = {
            'l_none': _t('Date Filter'),
            'l_day': _t('Today'),
            't_week': _t('This Week'),
            'td_week': _t('Week To Date'),
            't_month': _t('This Month'),
            'td_month': _t('Month to Date'),
            't_quarter': _t('This Quarter'),
            'td_quarter': _t('Quarter to Date'),
            't_year': _t('This Year'),
            'td_year': _t('Year to Date'),
            'n_day': _t('Next Day'),
            'n_week': _t('Next Week'),
            'n_month': _t('Next Month'),
            'n_quarter': _t('Next Quarter'),
            'n_year': _t('Next Year'),
            'ls_day': _t('Last Day'),
            'ls_week': _t('Last Week'),
            'ls_month': _t('Last Month'),
            'ls_quarter': _t('Last Quarter'),
            'ls_year': _t('Last Year'),
            'l_week': _t('Last 7 days'),
            'l_month': _t('Last 30 days'),
            'l_quarter': _t('Last 90 days'),
            'l_year': _t('Last 365 days'),
            'ls_past_until_now': _t('Past Till Now'),
            'ls_pastwithout_now': _t('Past Excluding Today'),
            'n_future_starting_now': _t('Future Starting Now'),
            'n_futurestarting_tomorrow': _t('Future Starting Tomorrow'),
            'l_custom': _t('Custom Filter'),
        };
        // To make sure date filter show date in specific order.
        this.ks_date_filter_selection_order = ['l_day', 't_week', 't_month', 't_quarter','t_year',
            'td_week','td_month','td_quarter', 'td_year','n_day','n_week', 'n_month', 'n_quarter', 'n_year',
            'ls_day','ls_week', 'ls_month', 'ls_quarter', 'ls_year', 'l_week', 'l_month', 'l_quarter', 'l_year',
            'ls_past_until_now', 'ls_pastwithout_now','n_future_starting_now', 'n_futurestarting_tomorrow',
            'l_custom'
        ];

        this.ks_dashboard_id = this.props.action.params.ks_dashboard_id;

        this.gridstack_options = {
            staticGrid:true,
            float: false,
            cellHeight: 80,
            styleInHead : true,
//          disableOneColumnMode: true,
        };
        if (isMobileOS()) {
            this.gridstack_options.disableOneColumnMode = false
        }
        this.gridstackConfig = {};
        this.grid = true;
        this.chartMeasure = {};
        this.chart_container = {};
        this.list_container = {};
        this.state = useState({
            ks_dashboard_name: '',
            ks_multi_layout: false,
            ks_dash_name: '',
            ks_dashboard_manager :false,
            date_selection_data: {},
            date_selection_order :[],
            ks_show_create_layout_option : true,
            ks_show_layout :false,
            ks_selected_board_id:false,
            ks_child_boards:false,
            ks_dashboard_data:{},
            ks_dn_pre_defined_filters:[],
            ks_dashboard_item_length:0,
            ks_dashboard_items:[],
            update:false
        })
        this.ksChartColorOptions = ['default', 'cool', 'warm', 'neon'];
        //       this.ksUpdateDashboardItem = this.ksUpdateDashboardItem.bind(this);
        this.ksDateFilterSelection = false;
        this.ksDateFilterStartDate = false;
        this.ksDateFilterEndDate = false;
        this.ksUpdateDashboard = {};
        $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">');
        if(this.props.action.context.ks_reload_menu){
            this.trigger_up('reload_menu_data', { keep_open: true, scroll_to_bottom: true});
        }
        var context = {
            ksDateFilterSelection: self.ksDateFilterSelection,
            ksDateFilterStartDate: self.ksDateFilterStartDate,
            ksDateFilterEndDate: self.ksDateFilterEndDate,
        }
        this.dn_state = {}
        this.dn_state['user_context']=context
        onWillStart(this.willStart);
        onWillRender(this.dashboard_mount);
        onMounted(() => this.grid_initiate());
    }


    willStart(){
        var self = this;
        var def;
        if (this.reload_menu_option.reload && this.reload_menu_option.menu_id) {
            def = this.getParent().actionService.ksDnReloadMenu(this.reload_menu_option.menu_id);
        }
        return $.when(def, loadBundle("ks_dashboard_ninja.ks_dashboard_lib")).then(function() {
            return self.ks_fetch_data().then(function(){
                return self.ks_fetch_items_data()
            });
        });
    }

    grid_initiate(){
        var self=this;
        var $gridstackContainer = $(".grid-stack");
        if($gridstackContainer.length){
            this.grid = GridStack.init(this.gridstack_options,$gridstackContainer[0]);
            if(this.ks_dashboard_data.ks_gridstack_config){
                this.gridstackConfig = JSON.parse(this.ks_dashboard_data.ks_gridstack_config);
            }
            for (var i = 0; i < this.state.ks_dashboard_items.length; i++) {
                var graphs = ['ks_scatter_chart','ks_bar_chart', 'ks_horizontalBar_chart', 'ks_line_chart', 'ks_area_chart', 'ks_doughnut_chart','ks_polarArea_chart','ks_pie_chart','ks_flower_view', 'ks_radar_view','ks_radialBar_chart','ks_map_view','ks_funnel_chart','ks_bullet_chart', 'ks_to_do', 'ks_list_view']
                var $ks_preview = $('#' + self.state.ks_dashboard_items[i].id)
                if ($ks_preview.length) {
                    if (self.state.ks_dashboard_items[i].id in self.gridstackConfig) {
                         self.grid.addWidget($ks_preview[0], {x:self.gridstackConfig[self.state.ks_dashboard_items[i].id].x, y:self.gridstackConfig[self.state.ks_dashboard_items[i].id].y, w:self.gridstackConfig[self.state.ks_dashboard_items[i].id].w, h: self.gridstackConfig[self.state.ks_dashboard_items[i].id].h, autoPosition:true, minW:2, maxW:null, minH:2, maxH:null, id:self.state.ks_dashboard_items[i].id});
                    } else if ( graphs.includes (self.state.ks_dashboard_items[i].ks_dashboard_item_type)) {
                         self.grid.addWidget($ks_preview[0], {x:0, y:0, w:5, h:5,autoPosition:true,minW:4,maxW:null,minH:3,maxH:null, id :self.state.ks_dashboard_items[i].id});
                    }else{
                        self.grid.addWidget($ks_preview[0], {x:0, y:0, w:3, h:2,autoPosition:true,minW:2,maxW:null,minH:2,maxH:2,id:self.state.ks_dashboard_items[i].id});
                    }
                }
            }
            this.grid.setStatic(true);
        }
        // Events //
        const ks_element = this.main_body.el;
        Object.values(ks_element.querySelectorAll(".ks_duplicate_item")).map((item) => { item.addEventListener('click', this.onKsDuplicateItemClick.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_move_item")).map((item) => { item.addEventListener('click', this.onKsMoveItemClick.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_dashboard_item_delete")).map((item) => { item.addEventListener('click', this._onKsDeleteItemClick.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_chart_xls_csv_export")).map((item) => { item.addEventListener('click', this.ksChartExportXlsCsv.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_chart_pdf_export")).map((item) => { item.addEventListener('click', this.ksChartExportPdf.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_chart_image_export")).map((item) => { item.addEventListener('click', this.ksChartExportimage.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_chart_json_export")).map((item) => { item.addEventListener('click', this.ksItemExportJson.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_dashboard_quick_edit_action_popup")).map((item) => { item.addEventListener('click', this.onEditItemTypeClick.bind(this))})
    }

    getContext() {
        var self = this;
        var context = {
            ksDateFilterSelection: self.ksDateFilterSelection,
            ksDateFilterStartDate: self.ksDateFilterStartDate,
            ksDateFilterEndDate: self.ksDateFilterEndDate,
        }
        if(self.dn_state['user_context']['ksDateFilterSelection'] !== undefined && self.ksDateFilterSelection !== 'l_none'){
            context = self.dn_state['user_context']
        }
        return Object.assign(context, session.user_context);
    }

    ks_fetch_data(){
        var self = this;
        return this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_fetch_dashboard_data",{
            model: 'ks_dashboard_ninja.board',
            method: 'ks_fetch_dashboard_data',
            args: [self.ks_dashboard_id],
            kwargs : {},
            context: self.getContext()
        }).then(function(result) {
        //                result = self.normalize_dn_data(result);
            self.ks_dashboard_data = result;
            self.ks_dashboard_data['ks_dashboard_id'] = self.props.action.params.ks_dashboard_id
            if(self.dn_state['domain_data'] != undefined){
                self.ks_dashboard_data.ks_dashboard_domain_data=self.dn_state['domain_data']
                Object.values(self.ks_dashboard_data.ks_dashboard_pre_domain_filter).map((x)=>{
                    if(self.dn_state['domain_data'][x['model']] != undefined){
                        if(self.dn_state['domain_data'][x['model']]['ks_domain_index_data'][0]['label'].indexOf(x['name']) ==-1){
                            self.ks_dashboard_data.ks_dashboard_pre_domain_filter[x['id']].active = false;
                        }
                    }
                    else{
                        self.ks_dashboard_data.ks_dashboard_pre_domain_filter[x['id']].active = false;
                    }
                })
            }
        });
    }

    async dashboard_mount(){
        var self = this;
        var items = self.ksSortItems(self.ks_dashboard_data.ks_item_data)
        self.state.ks_dashboard_items = items
        self.ksRenderDashboard();
//        if (Object.keys(self.ks_dashboard_data.ks_item_data).length) {
//        //todo write function
//        //            self._ksSaveCurrentLayout();
//        //            session.user_context['gridstack_config'] = self.ks_get_current_gridstack_config();
//        }

    }

    ks_fetch_items_data(){
        var self = this;
        var items_promises = []
        self.ks_dashboard_data.ks_dashboard_items_ids.forEach(function(item_id){
            items_promises.push(self._rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_fetch_item",{
                model: "ks_dashboard_ninja.board",
                method: "ks_fetch_item",
                context: self.getContext(),
                args : [[item_id], self.ks_dashboard_id, self.ksGetParamsForItemFetch(item_id)],
                kwargs:{}
            }).then(function(result){
                self.ks_dashboard_data.ks_item_data[item_id] = result[item_id];
            }));
        });
        self.state.ks_dashboard_name = self.ks_dashboard_data.name,
        self.state.ks_multi_layout = self.ks_dashboard_data.multi_layouts,
        self.state.ks_dash_name = self.ks_dashboard_data.name,
        self.state.ks_dashboard_manager = self.ks_dashboard_data.ks_dashboard_manager,
        self.state.date_selection_data = self.ks_date_filter_selections,
        self.state.date_selection_order = self.ks_date_filter_selection_order,
        self.state.ks_show_create_layout_option = (Object.keys(self.ks_dashboard_data.ks_item_data).length > 0) && self.ks_dashboard_data.ks_dashboard_manager,
        self.state.ks_show_layout = self.ks_dashboard_data.ks_dashboard_manager && self.ks_dashboard_data.ks_child_boards && true,
        self.state.ks_selected_board_id = self.ks_dashboard_data.ks_selected_board_id,
        self.state.ks_child_boards = self.ks_dashboard_data.ks_child_boards,
        self.state.ks_dashboard_data = self.ks_dashboard_data,
        self.state.ks_dn_pre_defined_filters = Object.values(self.ks_dashboard_data.ks_dashboard_pre_domain_filter).sort(function(a, b){return a.sequence - b.sequence}),
        self.state.ks_dashboard_item_length = self.ks_dashboard_data.ks_dashboard_items_ids.length
        self.state.update = false
        return Promise.all(items_promises)

    }
    get value(){
        var self = this;
        var info = {
        ks_dashboard_name : self.ks_dashboard_data.name,
        ks_multi_layout : self.ks_dashboard_data.multi_layouts,
        ks_dash_name : self.ks_dashboard_data.name,
        ks_dashboard_manager : self.ks_dashboard_data.ks_dashboard_manager,
        date_selection_data : self.ks_date_filter_selections,
        date_selection_order : self.ks_date_filter_selection_order,
        ks_show_create_layout_option : (Object.keys(self.ks_dashboard_data.ks_item_data).length > 0) && self.ks_dashboard_data.ks_dashboard_manager,
        ks_show_layout : self.ks_dashboard_data.ks_dashboard_manager && self.ks_dashboard_data.ks_child_boards && true,
        ks_selected_board_id : self.ks_dashboard_data.ks_selected_board_id,
        ks_child_boards : self.ks_dashboard_data.ks_child_boards,
        ks_dashboard_data : self.ks_dashboard_data,
        ks_dn_pre_defined_filters : Object.values(self.ks_dashboard_data.ks_dashboard_pre_domain_filter).sort(function(a, b){return a.sequence - b.sequence}),
        ks_dashboard_item_length : self.ks_dashboard_data.ks_dashboard_items_ids.length,
        update : false

    }
    return info
    }
    get ks_dashboard_items(){
        var self = this;
        return self.state.ks_dashboard_items
    }

    ksGetParamsForItemFetch(){
        return {};
    }

    ksRenderDashboard(){
        var self = this;
//      self.$el.empty();
//      self.$el.addClass('ks_dashboard_ninja d-flex flex-column');
        if (self.ks_dashboard_data.ks_child_boards) self.ks_dashboard_data.name = this.ks_dashboard_data.ks_child_boards[self.ks_dashboard_data.ks_selected_board_id][0];
        if (!isMobileOS()) {
            $(self.header.el).addClass("ks_dashboard_header_sticky")
        }
        if (Object.keys(self.ks_dashboard_data.ks_item_data).length===0){
            $(self.header.el).find('.ks_dashboard_link').addClass("d-none");
            $(self.header.el).find('.ks_dashboard_edit_layout').addClass("d-none");
        }
//      self.ksRenderDashboardMainContent();
    }

    ksRenderDashboardMainContent(){
        var self = this;
        if (isMobileOS() && $('#ks_dn_layout_button :first-child').length > 0) {
            $('.ks_am_element').append($('#ks_dn_layout_button :first-child')[0].innerText);
            $(self.header.el).find("#ks_dn_layout_button").addClass("ks_hide");
        }
        if (Object.keys(self.ks_dashboard_data.ks_item_data).length){
// todo  implement below mentioned function
//                self._renderDateFilterDatePicker();
            $(self.header.el).find('.ks_dashboard_link').removeClass("ks_hide");
            var $gridstackContainer = $(self.main_body.el).find(".grid-stack");
            self.grid = GridStack.init(self.gridstack_options,$gridstackContainer[0]);
//                var items = self.ksSortItems(self.ks_dashboard_data.ks_item_data);
            self.ksRenderDashboardItems(items);
// In gridstack version 0.3 we have to make static after adding element in dom
            self.grid.setStatic(true);

        } else if (!Object.keys(self.ks_dashboard_data.ks_item_data).length) {
            $(self.header.el).find('.ks_dashboard_link').addClass("ks_hide");
        }
    }

    ksSortItems(ks_item_data) {
        var items = []
        var self = this;
        var item_data = Object.assign({}, ks_item_data);
        if (self.ks_dashboard_data.ks_gridstack_config) {
            self.gridstackConfig = JSON.parse(self.ks_dashboard_data.ks_gridstack_config);
            var a = Object.values(self.gridstackConfig);
            var b = Object.keys(self.gridstackConfig);
            for (var i = 0; i < a.length; i++) {
                a[i]['id'] = b[i];
            }
            a.sort(function(a, b) {
                return (35 * a.y + a.x) - (35 * b.y + b.x);
            });
            for (var i = 0; i < a.length; i++) {
                if (item_data[a[i]['id']]) {
                    items.push(item_data[a[i]['id']]);
                    delete item_data[a[i]['id']];
                }
            }
        }

        return items.concat(Object.values(item_data));
    }


    ksUpdateDashboardItem(ids) {
            var self = this;
            for (var i = 0; i < ids.length; i++) {

                var item_data = self.ks_dashboard_data.ks_item_data[ids[i]]
                if (item_data['ks_dashboard_item_type'] == 'ks_list_view') {
                    var item_view = self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]");
                    var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                    item_view.children().find('.ks_list_view_heading').prop('title', name);
                    item_view.children().find('.ks_list_view_heading').text(name);
                    item_view.find('.card-body').empty();
                    item_view.find('.ks_dashboard_item_drill_up').addClass('d-none')
                    item_view.find('.ks_dashboard_item_action_export').removeClass('d-none')
                    item_view.find('.ks_dashboard_quick_edit_action_popup ').removeClass('d-none')
                    item_view.find('.card-body').append(self.renderListViewData(item_data));
                    var rows = JSON.parse(item_data['ks_list_view_data']).data_rows;
                    var ks_length = rows ? rows.length : false;
                    if (ks_length) {
                        if (item_view.find('.ks_pager_name')) {
                            item_view.find('.ks_pager_name').empty();
                            var $ks_pager_container = QWeb.render('ks_pager_template', {
                                item_id: ids[i],
                                intial_count: item_data.ks_pagination_limit,
                                offset : 1
                            })
                            item_view.find('.ks_pager_name').append($($ks_pager_container));
                        }

                            if (ks_length < item_data.ks_pagination_limit) item_view.find('.ks_load_next').addClass('ks_event_offer_list');
                                item_view.find('.ks_value').text("1-" + JSON.parse(item_data['ks_list_view_data']).data_rows.length);

                            if (item_data.ks_record_data_limit == item_data.ks_pagination_limit || item_data.ks_record_count==item_data.ks_pagination_limit) {
                                item_view.find('.ks_load_next').addClass('ks_event_offer_list');
                            }
                    } else {
                        item_view.find('.ks_pager').addClass('d-none');
                    }
                } else if (item_data['ks_dashboard_item_type'] == 'ks_tile') {
                    self.state.update = true
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".ks_dashboard_item_hover").replaceWith($(item_view).find('.ks_dashboarditem_id'));
                } else if (item_data['ks_dashboard_item_type'] == 'ks_kpi') {
                    var item_view = self.renderKpi(item_data);
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".ks_dashboard_item_hover").replaceWith($(item_view).find('.ks_dashboarditem_id'));
                } else  if (item_data['ks_dashboard_item_type'] == 'ks_to_do'){
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").empty();
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").append(self.ksRenderToDoDashboardView(item_data)[0].children());
                }else if(item_data['ks_dashboard_item_type'] == 'ks_funnel_chart'){

                    if (item_data['ks_funnel_item_color']){
                         this._rpc({
                            model: 'ks_dashboard_ninja.item',
                            method: 'write',
                            args: [item_data.id, {
                                "ks_funnel_item_color": item_data['ks_funnel_item_color']
                            }],
                        }).then(function() {
                            item_data['ks_funnel_item_color'] = item_data['ks_funnel_item_color']
                        });
                    }
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").remove();
                    var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').prop('title',name)
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').text(name)
                    self.ksrenderfunnelchart(self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]"),item_data);
                }else if(item_data['ks_dashboard_item_type'] == 'ks_bullet_chart'){

                    if (item_data['ks_funnel_item_color']){
                         this._rpc({
                            model: 'ks_dashboard_ninja.item',
                            method: 'write',
                            args: [item_data.id, {
                                "ks_funnel_item_color": item_data['ks_funnel_item_color']
                            }],
                        }).then(function() {
                            item_data['ks_funnel_item_color'] = item_data['ks_funnel_item_color']
                        });
                    }

                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").remove();
                    var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').prop('title',name)
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').text(name)
                    self. ksrenderbulletchart(self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]"),item_data);
                }else if(item_data['ks_dashboard_item_type'] == 'ks_flower_view'){

                    if (item_data['ks_flower_item_color']){
                         this._rpc({
                            model: 'ks_dashboard_ninja.item',
                            method: 'write',
                            args: [item_data.id, {
                                "ks_flower_item_color": item_data['ks_flower_item_color']
                            }],
                        }).then(function() {
                            item_data['ks_flower_item_color'] = item_data['ks_flower_item_color']
                        });
                    }
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").remove();
                    var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').prop('title',name)
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').text(name)
                    self.ksrenderflowerchart(self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]"),item_data);
                }else if(item_data['ks_dashboard_item_type'] == 'ks_radialBar_chart'){

                    if (item_data['ks_radial_item_color']){
                         this._rpc({
                            model: 'ks_dashboard_ninja.item',
                            method: 'write',
                            args: [item_data.id, {
                                "ks_radial_item_color": item_data['ks_radial_item_color']
                            }],
                        }).then(function() {
                            item_data['ks_radial_item_color'] = item_data['ks_radial_item_color']
                        });
                    }
                     self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").remove();
                     var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                     self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').prop('title',name)
                     self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').text(name)
                     self.ksrenderradialchart(self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]"),item_data);
                }else if(item_data['ks_dashboard_item_type'] == 'ks_map_view'){
                     self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").remove();
                     var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                     self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').prop('title',name)
                     self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').text(name)
                     self.ksrendermapview(self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]"),item_data);
                }else{
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").empty()
                    var name = item_data.name ?item_data.name : item_data.ks_model_display_name;
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').prop('title',name)
                    self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]").find('.ks_chart_heading').text(name)
                    self._renderChart(self.$el.find(".grid-stack-item[gs-id=" + item_data.id + "]"), item_data);
                }

            }
            self.grid.setStatic(true);
        }

    onKsDuplicateItemClick(e) {
        var self = this;
        var ks_item_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).parent().attr('id');
        var dashboard_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select').val();
        var dashboard_name = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select option:selected').text();
        this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/copy",{
            model: 'ks_dashboard_ninja.item',
            method: 'copy',
            args: [parseInt(ks_item_id), {
                'ks_dashboard_ninja_board_id': parseInt(dashboard_id)
            }],
            kwargs:{},
        }).then(function(result) {
            self.notification.add(_t('Selected item is duplicated to ' + dashboard_name + ' .'),{
                title:_t("Item Duplicated"),
                type: 'success',
            });

                    $.when(self.ks_fetch_data()).then(function() {
                        $.when(self.ks_fetch_items_data()).then(function(){
                            var js_id = self.actionService.currentController.jsId
                            self.actionService.restore(js_id)
                        });
                    });
            })

    }

    onKsMoveItemClick(e) {
        var self = this;
        var ks_item_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).parent().attr('id');
        var dashboard_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select').val();
        var dashboard_name = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select option:selected').text();
        this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/write",{
            model: 'ks_dashboard_ninja.item',
            method: 'write',
            args: [parseInt(ks_item_id), {
                'ks_dashboard_ninja_board_id': parseInt(dashboard_id)
            }],
            kwargs:{}
        }).then(function(result) {
            self.notification.add(_t('Selected item is moved to ' + dashboard_name + ' .'),{
                title:_t("Item Moved"),
                type: 'success',
            });
            $.when(self.ks_fetch_data()).then(function() {
                $.when(self.ks_fetch_items_data()).then(function(){
                    var js_id = self.actionService.currentController.jsId
                    self.actionService.restore(js_id)
                });
            });
        });
    }

    _onKsDeleteItemClick(e) {
        var self = this;
        var item = $($(e.currentTarget).parentsUntil('.grid-stack').slice(-1)[0])
        var id = parseInt($($(e.currentTarget).parentsUntil('.grid-stack').slice(-1)[0]).attr('gs-id'));
        self.ks_delete_item(id, item);
        e.stopPropagation();
    }

    ks_delete_item(id, item) {
        var self = this;
        this.dialogService.add(ConfirmationDialog, {
        body: _t("Are you sure that you want to remove this item?"),
        confirm: () => {
            self._rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/unlink",{
                model: 'ks_dashboard_ninja.item',
                method: 'unlink',
                args: [id],
                kwargs:{}
            }).then(function(result) {

                        // Clean Item Remove Process.
                self.ks_remove_update_interval();
                delete self.ks_dashboard_data.ks_item_data[id];
                self.grid.removeWidget(item);

                if (Object.keys(self.ks_dashboard_data.ks_item_data).length > 0) {
                    self._ksSaveCurrentLayout();
                }

                    $.when(self.ks_fetch_data()).then(function() {
                        $.when(self.ks_fetch_items_data()).then(function(){
                            var js_id = self.actionService.currentController.jsId
                            self.actionService.restore(js_id)
                        });
                    });
                });

            },
            cancel: () => {},
            });
        }
        removeitems(){
            var self = this;
            var ks_items  = Object.values((self.main_body.el).querySelectorAll(".grid-stack-item"));
            ks_items.forEach((item) =>{
             self.grid.removeWidget(item);
             })
            }

    _ksSaveCurrentLayout() {
        var self = this;
        var grid_config = self.ks_get_current_gridstack_config();
        var model = 'ks_dashboard_ninja.child_board';
        var rec_id = self.ks_dashboard_data.ks_gridstack_config_id;
        self.ks_dashboard_data.ks_gridstack_config = JSON.stringify(grid_config);
        if(this.ks_dashboard_data.ks_selected_board_id && this.ks_dashboard_data.ks_child_boards){
            this.ks_dashboard_data.ks_child_boards[this.ks_dashboard_data.ks_selected_board_id][1] = JSON.stringify(grid_config);
            if (this.ks_dashboard_data.ks_selected_board_id !== 'ks_default'){
                rec_id = this.ks_dashboard_data.ks_selected_board_id;
            }
        }
        if (!isMobileOS()) {
            this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.child_board/write",{
                model: 'ks_dashboard_ninja.child_board',
                method: 'write',
                args: [rec_id, {
                    "ks_gridstack_config": JSON.stringify(grid_config)
                }],
                kwargs:{}
            });
        }
    }

    ks_get_current_gridstack_config(){
        var self = this;
        if (document.querySelector('.grid-stack') && document.querySelector('.grid-stack').gridstack){
            var items = document.querySelector('.grid-stack').gridstack.el.gridstack.engine.nodes;
        }
        var grid_config = {}

        if (items){
            for (var i = 0; i < items.length; i++) {
                grid_config[items[i].id] = {
                    'x': items[i].x,
                    'y': items[i].y,
                    'w': items[i].w,
                    'h': items[i].h,
                }
            }
        }
        return grid_config;
    }

        ////////////////////////////// Export functions ////////////////////////////////////////////
    async ksChartExportXlsCsv(e) {
        var chart_id = e.currentTarget.dataset.chartId;
        var name = this.ks_dashboard_data.ks_item_data[chart_id].name;
        var context = this.getContext();
        if (this.ks_dashboard_data.ks_item_data[chart_id].ks_dashboard_item_type === 'ks_list_view'){
        var params = this.ksGetParamsForItemFetch(parseInt(chart_id));
        var data = {
            "header": name,
            "chart_data": this.ks_dashboard_data.ks_item_data[chart_id].ks_list_view_data,
            "ks_item_id": chart_id,
            "ks_export_boolean": true,
            "context": context,
            'params':params,
        }
        }else{
            var data = {
                "header": name,
                "chart_data": this.ks_dashboard_data.ks_item_data[chart_id].ks_chart_data,
        }
        }
        const blockUI = new BlockUI();
        await download({
            url: '/ks_dashboard_ninja/export/' + e.currentTarget.dataset.format,
            data: {
                data: JSON.stringify(data)
            },
            complete: () => unblockUI,
            error: (error) => self.call('crash_manager', 'rpc_error', error),
        });
    }

    ksChartExportPdf (e){
        var self = this;
        var chart_id = e.currentTarget.dataset.chartId;
        var name = this.ks_dashboard_data.ks_item_data[chart_id].name;
        var base64_image
        base64_image = $($(e.target).parentsUntil(".grid-stack-item").slice(-1)[0]).find("canvas")[0].toDataURL("image/png")
        var $ks_el = $($($(self.main_body.el).find(".grid-stack-item[gs-id=" + chart_id + "]")).find('.ks_chart_card_body'));
        var ks_height = $ks_el.height()
        var ks_image_def = {
            content: [{
                    image: base64_image,
                    width: 500,
                    height: ks_height,
                    }],
            images: {
                bee: base64_image
            }
        };
        pdfMake.createPdf(ks_image_def).download(name + '.pdf');
    }
    ksChartExportimage(e){
        var self = this;
        var chart_id = e.currentTarget.dataset.chartId;
        var name = this.ks_dashboard_data.ks_item_data[chart_id].name;
        var base64_image
        base64_image = $($(e.target).parentsUntil(".grid-stack-item").slice(-1)[0]).find("canvas")[0].toDataURL("image/png")
        const link = document.createElement('a');
        link.href =  base64_image;
        link.download = name + 'png'
        document.body.appendChild(link);
        link.click()
        document.body.removeChild(link);
    }
    async ksItemExportJson(e) {
        var itemId = $(e.target).parents('.ks_dashboard_item_button_container')[0].dataset.item_id;
        var name = this.ks_dashboard_data.ks_item_data[itemId].name;
        var data = {
            'header': name,
            item_id: itemId,
        }
        const blockUI = new BlockUI();
        await download({
            url: '/ks_dashboard_ninja/export/item_json',
            data: {
                data: JSON.stringify(data)
            },
            complete: () => unblockUI,
            error: (error) => self.call('crash_manager', 'rpc_error', error),
        });
        e.stopPropagation();
    }
    ksRenderChartColorOptions(e) {
        var self = this;
        if (!$(e.currentTarget).parent().hasClass('ks_date_filter_selected')) {
            //            FIXME : Correct this later.
            var $parent = $(e.currentTarget).parent().parent();
            $parent.find('.ks_date_filter_selected').removeClass('ks_date_filter_selected')
            $(e.currentTarget).parent().addClass('ks_date_filter_selected')
            var item_data = self.ks_dashboard_data.ks_item_data[$parent.data().itemId];
            var chart_data = JSON.parse(item_data.ks_chart_data);
            this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/write",{
                    model: 'ks_dashboard_ninja.item',
                    method: 'write',
                    args: [$parent.data().itemId, {
                        "ks_chart_item_color": e.currentTarget.dataset.chartColor
                    }],
                    kwargs:{}
            }).then(function() {
                    self.ks_dashboard_data.ks_item_data[$parent.data().itemId]['ks_chart_item_color'] = e.target.dataset.chartColor;
                    $(self.main_body.el).find(".grid-stack-item[gs-id=" + item_data.id + "]").find(".card-body").remove();
                    $.when(self.ks_fetch_data()).then(function() {
                        $.when(self.ks_fetch_items_data()).then(function(){
                            var js_id = self.actionService.currentController.jsId
                            self.actionService.restore(js_id)
                        });
                    });
            })
        }
    }


    ksOnDashboardExportClick(ev){
        ev.preventDefault();
        var self= this;
        var dashboard_id = JSON.stringify(this.ks_dashboard_id);
            this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_dashboard_export", {
            model: 'ks_dashboard_ninja.board',
            method: "ks_dashboard_export",
            args: [dashboard_id],
            kwargs: {dashboard_id: dashboard_id}
        }).then(function(result) {
            var name = "dashboard_ninja";
            var data = {
                "header": name,
                "dashboard_data":
                result,
            }
            download({
            data: {
                data:JSON.stringify(data)
            },
                url: '/ks_dashboard_ninja/export/dashboard_json',
            });
        });
    }

    ksOnDashboardImportClick(ev){
        ev.preventDefault();
        var self = this;
        var dashboard_id = this.ks_dashboard_id;
        this._rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_open_import", {
            model: 'ks_dashboard_ninja.board',
            method: 'ks_open_import',
            args: [dashboard_id],
            kwargs: {
                dashboard_id: dashboard_id
            }
        }).then((result)=>{
             self.actionService.doAction(result)
        });
    }

    _onKsSaveLayoutClick(){
        this.grid.setStatic(true)
        var self = this;
        //        Have  to save dashboard here
        var dashboard_title = $('#ks_dashboard_title_input').val();
        if (dashboard_title != false && dashboard_title != 0 && dashboard_title !== self.ks_dashboard_data.name) {
            self.ks_dashboard_data.name = dashboard_title;
            var model = 'ks_dashboard_ninja.board';
            var rec_id = self.ks_dashboard_id;

            if(this.ks_dashboard_data.ks_selected_board_id && this.ks_dashboard_data.ks_child_boards){
                this.ks_dashboard_data.ks_child_boards[this.ks_dashboard_data.ks_selected_board_id][0] = dashboard_title;
                if (this.ks_dashboard_data.ks_selected_board_id !== 'ks_default'){
                    model = 'ks_dashboard_ninja.child_board';
                    rec_id = this.ks_dashboard_data.ks_selected_board_id;
                }
            }
            this._rpc({
                model: model,
                method: 'write',
                args: [rec_id, {
                    'name': dashboard_title
                }],
            })
        }
        if (this.ks_dashboard_data.ks_item_data) self._ksSaveCurrentLayout();
        self._ksRenderActiveMode();
    }

    _onKsCancelLayoutClick(){
        var self = this;
        //        render page again
        $.when(self.ks_fetch_data()).then(function(result) {
            $.when(self.ks_fetch_items_data()).then(function(result){
//                self.ksRenderDashboard();

                    $.when(self.ks_fetch_data()).then(function() {
                        $.when(self.ks_fetch_items_data()).then(function(){
                            var js_id = self.actionService.currentController.jsId
                            self.actionService.restore(js_id)
                        });
                    });
            });
        });
    }

    _ksRenderActiveMode(){
        var self = this
        self.ks_mode = 'active';

        if (self.grid && $('.grid-stack').data('gridstack')) {
            $('.grid-stack').data('gridstack').disable();
        }

        if (self.ks_dashboard_data.ks_child_boards) {
            var $layout_container = $(QWeb.render('ks_dn_layout_container', {
                ks_selected_board_id: self.ks_dashboard_data.ks_selected_board_id,
                ks_child_boards: self.ks_dashboard_data.ks_child_boards,
                ks_multi_layout: self.ks_dashboard_data.multi_layouts,
                ks_dash_name: self.ks_dashboard_data.name
            }));
            $('#ks_dashboard_title .ks_am_element').replaceWith($layout_container);
            $('#ks_dashboard_title_label').replaceWith($layout_container);
        } else {
            $('#ks_dashboard_title_label').text(self.ks_dashboard_data.name);
        }

        $('#ks_dashboard_title_label').text(self.ks_dashboard_data.name);

        $('.ks_am_element').removeClass("ks_hide");
        $('.ks_em_element').addClass("ks_hide");
        $('.ks_dashboard_print_pdf').removeClass("ks_hide");
        if (self.ks_dashboard_data.ks_item_data) $('.ks_am_content_element').removeClass("ks_hide");

        $(self.main_body.el).find('.ks_item_not_click').addClass('ks_item_click').removeClass('ks_item_not_click')
        $(self.main_body.el).find('.ks_dashboard_item').addClass('ks_dashboard_item_header_hover')
        $(self.main_body.el).find('.ks_dashboard_item_header').addClass('ks_dashboard_item_header_hover')

        $(self.main_body.el).find('.ks_dashboard_item_l2').addClass('ks_dashboard_item_header_hover')
        $(self.main_body.el).find('.ks_dashboard_item_header_l2').addClass('ks_dashboard_item_header_hover')

        //      For layout 5
        $(self.main_body.el).find('.ks_dashboard_item_l5').addClass('ks_dashboard_item_header_hover')


        $(self.main_body.el).find('.ks_dashboard_item_button_container').addClass('ks_dashboard_item_header_hover');

        $(self.header.el).find('.ks_dashboard_top_settings').removeClass("ks_hide")
        $(self.header.el).find('.ks_dashboard_edit_mode_settings').addClass("ks_hide")

        $(self.main_body.el).find('.ks_start_tv_dashboard').removeClass('ks_hide');
        $(self.main_body.el).find('.ks_chart_container').removeClass('ks_item_not_click ks_item_click');
        $(self.main_body.el).find('.ks_list_view_container').removeClass('ks_item_click');


        self.grid.commit();
    }

    ks_remove_update_interval(){
        var self = this;
        if (self.ksUpdateDashboard) {
            Object.values(self.ksUpdateDashboard).forEach(function(itemInterval) {
                clearInterval(itemInterval);
            });
            self.ksUpdateDashboard = {};
        }
    }

    onKsEditLayoutClick(e) {
        var self = this;
        self.grid.setStatic(false);
        self._ksRenderEditMode();
    }

    _ksRenderEditMode(){
        var self = this;
        self.ks_mode = 'edit';
        self.ks_remove_update_interval();

        // Update the value of an input element with the ID 'ks_dashboard_title_input'
        // using the current dashboard name
        $('#ks_dashboard_title_input').val(self.ks_dashboard_data.name);

        // Hide and show certain elements based on the edit mode
        $('.ks_am_element').addClass("ks_hide");
        $('.ks_em_element').removeClass("ks_hide");
        $('.ks_dashboard_print_pdf').addClass("ks_hide");

        // Update classes for various dashboard elements to control their styling
        $(self.main_body.el).find('.ks_item_click').addClass('ks_item_not_click').removeClass('ks_item_click');
        $(self.main_body.el).find('.ks_dashboard_item').removeClass('ks_dashboard_item_header_hover');
        $(self.main_body.el).find('.ks_dashboard_item_header').removeClass('ks_dashboard_item_header_hover');
        $(self.main_body.el).find('.ks_dashboard_item_l2').removeClass('ks_dashboard_item_header_hover');
        $(self.main_body.el).find('.ks_dashboard_item_header_l2').removeClass('ks_dashboard_item_header_hover');
        $(self.main_body.el).find('.ks_dashboard_item_l5').removeClass('ks_dashboard_item_header_hover');
        $(self.main_body.el).find('.ks_dashboard_item_button_container').removeClass('ks_dashboard_item_header_hover');

//        $(self.header.el).find('.ks_dashboard_link').addClass("ks_hide")
        $(self.header.el).find('.ks_dashboard_top_settings').addClass("ks_hide")
        $(self.header.el).find('.ks_dashboard_edit_mode_settings').removeClass("ks_hide")

        // Hide elements related to TV dashboard and make certain elements not clickable
        $(self.main_body.el).find('.ks_start_tv_dashboard').addClass('ks_hide');
        $(self.main_body.el).find('.ks_chart_container').addClass('ks_item_not_click');
        $(self.main_body.el).find('.ks_list_view_container').addClass('ks_item_not_click');

        if (self.grid) {
            self.grid.enable();
        }
    }


    onAddItemTypeClick(e) {
        var self = this;
        if (e.currentTarget.dataset.item !== "ks_json") {
            self.actionService.doAction({
                type: 'ir.actions.act_window',
                res_model: 'ks_dashboard_ninja.item',
                view_id: 'ks_dashboard_ninja_list_form_view',
                views: [[false, 'form']],
                target: 'current',
                context: {
                    'ks_dashboard_id': self.ks_dashboard_id,
                    'ks_dashboard_item_type': e.currentTarget.dataset.item,
                    'form_view_ref': 'ks_dashboard_ninja.item_form_view',
                    'form_view_initial_mode': 'edit',
                    'ks_set_interval': self.ks_dashboard_data.ks_set_interval,
                    'ks_data_formatting':self.ks_dashboard_data.ks_data_formatting,
                },
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb,
            });
        } else {
            self.ksImportItemJson(e);
        }
    }

    ksImportItemJson(e) {
        var self = this;
        $('.ks_input_import_item_button').click();
    }

    ksImportItem(e) {
        var self = this;
        var fileReader = new FileReader();
        fileReader.onload = function() {
            $('.ks_input_import_item_button').val('');
            self._rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_import_item", {
            model: 'ks_dashboard_ninja.board',
            method: 'ks_import_item',
            args: [self.ks_dashboard_id],
            kwargs: {
                file: fileReader.result,
                dashboard_id: self.ks_dashboard_id
            }
            }).then(function(result) {
                if (result === "Success") {

                    $.when(self.ks_fetch_data()).then(function() {
                        $.when(self.ks_fetch_items_data()).then(function(){
                            var js_id = self.actionService.currentController.jsId
                            self.actionService.restore(js_id)
                        });
                    });
                }
            });
        };
        fileReader.readAsText($('.ks_input_import_item_button').prop('files')[0]);
    }

    ksOnDashboardSettingClick(ev){
        var self= this;
        var dashboard_id = this.ks_dashboard_id;
        var action = {
            name: _t('ks_open_setting'),
            type: 'ir.actions.act_window',
            res_model: 'ks_dashboard_ninja.board',
            res_id: dashboard_id,
            domain: [],
            context: {'create':false},
            views: [
                [false, 'form']
            ],
            view_mode: 'form',
            target: 'new',
        }
        self.actionService.doAction(action)
    }

    ksOnDashboardDeleteClick(ev){
        ev.preventDefault();
        var dashboard_id = this.ks_dashboard_id;
        var self= this;
        self.dialogService.add(ConfirmationDialog, {
            body: _t("Are you sure you want to delete this dashboard ?"),
            confirm: () => {
                this._rpc("/web/dataset/call_kw/ks.dashboard.delete.wizard/ks_delete_record", {
                    model: 'ks.dashboard.delete.wizard',
                    method: "ks_delete_record",
                    args: [self.ks_dashboard_id],
                    kwargs: {dashboard_id: dashboard_id}
                }).then((result)=>{
                self.actionService.doAction(result)
                });
            },
        });
    }

    ksOnDashboardCreateClick(ev){
        var self= this;
        var action = {
            name: _t('Create Dashboard'),
            type: 'ir.actions.act_window',
            res_model: 'ks.dashboard.wizard',
            domain: [],
            context: {
            },
            views: [
                [false, 'form']
            ],
            view_mode: 'form',
            target: 'new',
        }
        self.actionService.doAction(action)
    }

    ksOnDashboardDuplicateClick(ev){
        ev.preventDefault();
        var self= this;
        var dashboard_id = this.ks_dashboard_id;
        this._rpc('/web/dataset/call_kw/ks.dashboard.duplicate.wizard/DuplicateDashBoard', {
            model: 'ks.dashboard.duplicate.wizard',
            method: "DuplicateDashBoard",
            args: [self.ks_dashboard_id],
            kwargs: {}
        }).then((result)=>{
            self.actionService.doAction(result)
        });
   }

    onEditItemTypeClick(ev) {
        if(ev.currentTarget.dataset.itemId){
            return this.actionService.doAction({
                type: "ir.actions.act_window",
                target: "new",
                res_model: 'ks_dashboard_ninja.item',
                res_id: parseInt(ev.currentTarget.dataset.itemId),
                views: [[false, "form"]],
                target: "current",
                context: {
                    active_id: parseInt(ev.currentTarget.dataset.itemId),
                },
            });
        }
    }
    kscreateaiitem(ev){
        var self= this;
        var action = {
            name: _t('Generate items with AI'),
            type: 'ir.actions.act_window',
            res_model: 'ks_dashboard_ninja.arti_int',
            domain: [],
            context: {
                'ks_dashboard_id':this.ks_dashboard_id
            },
            views: [
                [false, 'form']
            ],
            view_mode: 'form',
            target: 'new',
           }
        self.actionService.doAction(action)
    }
    kscreateaidashboard(ev){
        var self= this;
        var action = {
                name: _t('Generate Dashboard with AI'),
                type: 'ir.actions.act_window',
                res_model: 'ks_dashboard_ninja.ai_dashboard',
                domain: [],
                context: {
                'ks_dashboard_id':this.ks_dashboard_id
                },
                views: [
                    [false, 'form']
                ],
                view_mode: 'form',
                target: 'new',
           }
           self.actionService.doAction(action)
        }





}



//KsDashboardNinja.props = {
//    action:{},
//    className:{ type: String },
//    actionId:false
//};
KsDashboardNinja.components = { Ksdashboardtile, Ksdashboardlistview,Ksdashboardgraph,Ksdashboardkpiview, Ksdashboardtodo};
KsDashboardNinja.template = "ksDashboardNinjaHeader"
registry.category("actions").add("ks_dashboard_ninja", KsDashboardNinja);

const ks_dn_webclient ={
    async loadRouterState(...args) {
        var self = this;
//      const sup = await this.super(...args);
        const sup = await super.loadRouterState(...args);
        const ks_reload_menu = async (id) =>  {
            this.menuService.reload().then(() => {
                self.menuService.selectMenu(id);
            });
        }
        this.actionService.ksDnReloadMenu = ks_reload_menu;
        return sup;
    },
};
patch(WebClient.prototype, ks_dn_webclient)