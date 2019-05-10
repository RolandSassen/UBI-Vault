package com.thinsia.ubivault.repository

import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.content.SharedPreferences
import androidx.core.content.edit
import com.thinsia.ubivault.domain.Account

private const val KEY_ETHEREUM_ACCOUNT = "account"

object PreferencesRepository {

    lateinit var sharedPrefs: SharedPreferences

    fun init(context: Context) {
        sharedPrefs= context.getSharedPreferences("preferences", MODE_PRIVATE)
    }

    fun getAccount(): Account {
        return Account(sharedPrefs.getString(KEY_ETHEREUM_ACCOUNT, "") ?: "")
    }

    fun saveAccount(account: Account) {
        sharedPrefs.edit { putString(KEY_ETHEREUM_ACCOUNT, account.hash) }
    }

    // For debug purposes only
    fun removeAccount() {
        sharedPrefs.edit { remove(KEY_ETHEREUM_ACCOUNT) }
    }

}