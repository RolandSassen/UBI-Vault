package com.thinsia.ubivault.overview

import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.navigation.findNavController
import com.thinsia.ubivault.R
import com.thinsia.ubivault.domain.Registration

class OverviewViewModel : ViewModel() {

    val registrationClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_overviewFragment_to_registrationFragment)
    }

    val moreInfoClickListener = View.OnClickListener { view ->
//        view.findNavController().navigate(R.id.action_overviewFragment_to_informationFragment)
    }

    private val registration: MutableLiveData<Registration> by lazy {
        MutableLiveData<Registration>().also {
            loadRegistration()
        }
    }

    fun getRegistration(): LiveData<Registration> {
        return registration
    }

    private fun loadRegistration() {
        // Do an asynchronous operation to fetch registration.
    }
}
