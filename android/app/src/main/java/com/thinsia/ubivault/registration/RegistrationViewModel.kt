package com.thinsia.ubivault.registration

import android.util.Log
import android.view.View
import androidx.databinding.ObservableBoolean
import androidx.databinding.ObservableField
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thinsia.ubivault.api.CitizensRemoteDataStore
import com.thinsia.ubivault.util.Event
import kotlinx.coroutines.launch

private const val TAG = "RegistrationViewModel"

class RegistrationViewModel : ViewModel() {

    private val _registrationError = MutableLiveData<Event<Unit>>()
    val registrationError : LiveData<Event<Unit>>
        get() = _registrationError

    private val _registrationSuccess = MutableLiveData<Event<String>>()
    val registrationSuccess : LiveData<Event<String>>
        get() = _registrationSuccess

    private val _hideKeyboard = MutableLiveData<Event<Unit>>()
    val hideKeyboard : LiveData<Event<Unit>>
        get() = _hideKeyboard

    private val _validateForm = MutableLiveData<Event<Unit>>()
    val validateForm : LiveData<Event<Unit>>
        get() = _validateForm

    private val _validateVerificationCode = MutableLiveData<Event<Unit>>()
    val validateVerificationCode : LiveData<Event<Unit>>
        get() = _validateVerificationCode

    val submitClickListener = View.OnClickListener { validateForm() }
    val verifyCodeClickListener = View.OnClickListener { validateVerificationCode() }

    val loading: ObservableBoolean = ObservableBoolean(false)

    val verificationId: ObservableField<String> = ObservableField()
    val verificationCode: ObservableField<String> = ObservableField()

    val firstName = ObservableField<String>()
    val lastName = ObservableField<String>()
    val city = ObservableField<String>()
    val country = ObservableField<String>()
    val email = ObservableField<String>()
    val ethereumAccount = ObservableField<String>()
    val phoneNumber = ObservableField<String>()

    private fun validateForm() {
        _hideKeyboard.value = Event(Unit)
        _validateForm.value = Event(Unit)
    }

    private fun validateVerificationCode() {
        _hideKeyboard.value = Event(Unit)
        _validateVerificationCode.value = Event(Unit)
    }

    private fun registerCitizen() {
        loading.set(true)
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
                    loading.set(false)
                    _registrationSuccess.value = Event(ethereumAccountHash)
                }
            } else {
                error = true
            }
            if (error) {
                loading.set(false)
                _registrationError.value = Event(Unit)
            }
        }
    }

    fun onVerificationFailed() {
        verificationId.set(null)
        verificationCode.set(null)
        loading.set(false)
        _registrationError.value = Event(Unit)
    }

    fun onCodeSent(verificationId: String?) {
        loading.set(false)
        this.verificationId.set(verificationId)
    }

    fun onFirebaseSignInSuccess() {
        verificationId.set(null)
        verificationCode.set(null)
        registerCitizen()
    }

    fun onFirebaseSignInFailure() {
        verificationId.set(null)
        verificationCode.set(null)
        loading.set(false)
        _registrationError.value = Event(Unit)
    }

    fun onLoadingStarted() {
        loading.set(true)
    }

}
