package com.thinsia.ubivault.util

import android.view.View
import androidx.databinding.BindingAdapter

@BindingAdapter("show")
fun View.visibleWhenNotNull(value: Any?) {
    var hidden = value == null
    if (value is Boolean) {
        hidden = !value
    }
    visibility = if (hidden) View.GONE else View.VISIBLE
}

@BindingAdapter("hide")
fun View.hideWhenNotNull(value: Any?) {
    var visible = value == null
    if (value is Boolean) {
        visible = !value
    }
    visibility = if (visible) View.VISIBLE else View.GONE
}
