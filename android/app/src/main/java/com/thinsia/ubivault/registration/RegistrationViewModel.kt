package com.thinsia.ubivault.registration

import android.view.View
import androidx.databinding.ObservableBoolean
import androidx.databinding.ObservableField
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.findNavController
import com.thinsia.ubivault.R
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

class RegistrationViewModel : ViewModel() {

    val submitClickListener = View.OnClickListener { view ->
        submitRegistration(view)
    }

    val loadingIndicator: ObservableBoolean = ObservableBoolean(false)

    val firstName = ObservableField<String>()
    val lastName = ObservableField<String>()
    val city = ObservableField<String>()
    val country = ObservableField<String>()
    val email = ObservableField<String>()
    val ethereumAccount = ObservableField<String>()
    val phoneNumber = ObservableField<String>()

    private fun submitRegistration(v: View) {
        loadingIndicator.set(true)
        viewModelScope.launch {
            // Wait a couple of seconds to mimic the back-end call delay
            delay(2000)
            loadingIndicator.set(false)
            if (Random.nextBoolean()) {
                v.findNavController().navigate(R.id.action_registrationFragment_to_registrationSuccessFragment)
            } else {
                v.findNavController().navigate(R.id.action_registrationFragment_to_registrationErrorFragment)
            }
        }
    }
}
