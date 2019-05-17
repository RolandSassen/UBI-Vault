package com.thinsia.ubivault.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.thinsia.ubivault.domain.Profile
import com.thinsia.ubivault.repository.PreferencesRepository

private const val TAG = "ProfileViewModel"

class ProfileViewModel : ViewModel() {

    private val _profile = MutableLiveData<Profile>()
    val profile: LiveData<Profile>
        get() = _profile

    init {
        PreferencesRepository.getProfile()?.let { profile ->
            _profile.value = profile
        }
    }

}
