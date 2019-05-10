package com.thinsia.ubivault

import android.app.Application
import com.thinsia.ubivault.repository.PreferencesRepository

class UbiVaultApplication: Application() {

    override fun onCreate() {
        super.onCreate()
        PreferencesRepository.init(this)
        if (BuildConfig.DEBUG) {
            PreferencesRepository.removeAccount()
        }
    }

}