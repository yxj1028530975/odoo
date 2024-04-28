/** @odoo-module */

import { registry } from "@web/core/registry";
import { localization } from "@web/core/l10n/localization";
import {formatDate,formatDateTime} from "@web/core/l10n/dates";
import { formatFloat,formatInteger } from "@web/views/fields/formatters";
import {parseDateTime,parseDate,} from "@web/core/l10n/dates";

const { useEffect, useRef, xml, onWillUpdateProps,Component} = owl;


class KsListViewPreview extends Component{
    setup() {
        super.setup();
        const self = this;

    }


    get value() {
        var self = this;
        var field = self.props.record.data;
        var ks_list_view_name;
        var list_view_data = JSON.parse(field.ks_list_view_data);
        var count = field.ks_record_count;
        if (field.name) ks_list_view_name = field.name;
        else if (field.ks_model_name) ks_list_view_name = field.ks_model_id[1];
        else ks_list_view_name = "Name";
        if (field.ks_list_view_type === "ungrouped" && list_view_data) {
            var index_data = list_view_data.date_index;
            if (index_data){
                for (var i = 0; i < index_data.length; i++) {
                    for (var j = 0; j < list_view_data.data_rows.length; j++) {
                        var index = index_data[i]
                        var date = list_view_data.data_rows[j]["data"][index]
                        if (date){
                         if( list_view_data.fields_type[index] === 'date'){
                                list_view_data.data_rows[j]["data"][index] = formatDate(parseDate(date), { format: localization.dateFormat })
                         } else{
                            list_view_data.data_rows[j]["data"][index] = formatDateTime(parseDateTime(date), { format: localization.dateTimeFormat })
                        }


                        }else {list_view_data.data_rows[j]["data"][index] = "";}
                    }
                }
            }
        }

        if (field.ks_list_view_data) {
            var data_rows = list_view_data.data_rows;
            if (data_rows){
                for (var i = 0; i < list_view_data.data_rows.length; i++) {
                for (var j = 0; j < list_view_data.data_rows[0]["data"].length; j++) {
                    if (typeof(list_view_data.data_rows[i].data[j]) === "number" || list_view_data.data_rows[i].data[j]) {
                        if (typeof(list_view_data.data_rows[i].data[j]) === "number") {
                            list_view_data.data_rows[i].data[j] = formatFloat(list_view_data.data_rows[i].data[j],{digits: [0, field.ks_precision_digits]})
                        }
                    } else {
                        list_view_data.data_rows[i].data[j] = "";
                    }
                }
            }
            }
        } else list_view_data = false;
        count = list_view_data && field.ks_list_view_type === "ungrouped" ? count - list_view_data.data_rows.length : false;
        count = count ? count <=0 ? false : count : false;
        var item_info = {
            ks_list_view_name: ks_list_view_name,
            list_view_data: list_view_data,
            count: count,
            layout: field.ks_list_view_layout,
            ks_show_records:field.ks_show_records
       }
        return item_info


    }

}
KsListViewPreview.template="ks_list_view";
export const KsListViewPreviewfield={
    component :KsListViewPreview,
}

registry.category("fields").add("ks_dashboard_list_view_preview", KsListViewPreviewfield);





