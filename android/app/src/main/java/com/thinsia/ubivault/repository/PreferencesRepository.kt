package com.thinsia.ubivault.repository

import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.content.SharedPreferences
import androidx.core.content.edit
import com.google.gson.Gson
import com.thinsia.ubivault.domain.Account
import com.thinsia.ubivault.domain.Profile

private const val KEY_ETHEREUM_ACCOUNT = "account"
private const val KEY_PROFILE_INFO = "profile"

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

    fun getProfile(): Profile? {
        return sharedPrefs.getString(KEY_PROFILE_INFO, null)?.let {
            Gson().fromJson(it, Profile::class.java)
        }
    }

    fun saveProfile(profile: Profile) {
        sharedPrefs.edit { putString(KEY_PROFILE_INFO, Gson().toJson(profile)) }
    }

}