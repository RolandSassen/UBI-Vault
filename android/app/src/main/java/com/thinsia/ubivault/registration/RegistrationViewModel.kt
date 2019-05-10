package com.thinsia.ubivault.registration

import android.util.Log
import android.view.View
import androidx.databinding.ObservableBoolean
import androidx.databinding.ObservableField
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.findNavController
import com.thinsia.ubivault.R
import com.thinsia.ubivault.api.CitizensRemoteDataStore
import kotlinx.coroutines.launch

private const val TAG = "RegistrationViewModel"

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
            val ethereumAccountHash = ethereumAccount.get()
            val phoneNumber = phoneNumber.get()
            var error = false
            if (ethereumAccountHash != null && phoneNumber != null) {
                val registerCitizenResponse= try {
                    CitizensRemoteDataStore.registerCitizenAsync(ethereumAccountHash, phoneNumber).await()
                } catch (e: Exception) {
                    Log.e(TAG, "Error registering citizen", e)
                    error = true
                    null
                }
                if (!error && registerCitizenResponse?.error != null) {
                    error = true
                }
                if (!error) {
                    val navDirections =
                        RegistrationFragmentDirections.actionRegistrationFragmentToRegistrationSuccessFragment(
                            ethereumAccountHash
                        )
                    loadingIndicator.set(false)
                    v.findNavController().navigate(navDirections)
                }
            } else {
                error = true
            }
            if (error) {
                loadingIndicator.set(false)
                v.findNavController().navigate(R.id.action_registrationFragment_to_registrationErrorFragment)
            }
        }
    }
}
