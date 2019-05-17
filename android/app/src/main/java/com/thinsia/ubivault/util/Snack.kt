package com.thinsia.ubivault.util

import android.view.View
import androidx.annotation.StringRes
import com.google.android.material.snackbar.Snackbar

fun View.snack(@StringRes messageRes: Int, length: Int = Snackbar.LENGTH_LONG, f: (Snackbar.() -> Unit)? = null) {
    snack(resources.getString(messageRes), length, f)
}

fun View.snack(message: String, length: Int = Snackbar.LENGTH_LONG, f: (Snackbar.() -> Unit)? = null) {
    Snackbar.make(this, message, length).run {
        f?.invoke(this)
        show()
    }
}

fun Snackbar.action(@StringRes actionRes: Int, color: Int? = null, listener: (View) -> Unit) {
    action(view.resources.getString(actionRes), color, listener)
}

fun Snackbar.action(action: String, color: Int? = null, listener: ((View) -> Unit)? = null) {
    setAction(action, listener)
    color?.let { setActionTextColor(color) }
}