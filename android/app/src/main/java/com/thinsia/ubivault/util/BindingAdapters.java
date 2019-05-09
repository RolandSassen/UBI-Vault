package com.thinsia.ubivault.util;

import android.view.View;
import androidx.databinding.BindingAdapter;

public class BindingAdapters {

    @BindingAdapter("show")
    public static void visibleWhenNotNull(View view, Object value) {
        boolean hidden = value == null;
        if (value instanceof Boolean) {
            hidden = !(boolean) value;
        }
        view.setVisibility(hidden ? View.GONE : View.VISIBLE);
    }

    @BindingAdapter("hide")
    public static void hideWhenNotNull(View view, Object value) {
        boolean visible = value == null;
        if (value instanceof Boolean) {
            visible = !(boolean) value;
        }
        view.setVisibility(visible ? View.VISIBLE : View.GONE);
    }

}
