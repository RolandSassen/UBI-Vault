package com.thinsia.ubivault.registration

import android.app.Activity
import android.content.Context.INPUT_METHOD_SERVICE
import android.os.Bundle
import android.util.Log
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProviders
import androidx.navigation.fragment.findNavController
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider
import com.thinsia.ubivault.R
import com.thinsia.ubivault.util.EventObserver
import com.thinsia.ubivault.util.snack
import java.util.concurrent.TimeUnit


class RegistrationFragment : Fragment() {

    companion object {
        val ETH_ACCOUNT_PATTERN = "^0x[a-fA-F0-9]{40}$".toPattern()
        fun newInstance() = RegistrationFragment()
    }

    private lateinit var viewModel: RegistrationViewModel

    private lateinit var binding: com.thinsia.ubivault.databinding.RegistrationFragmentBinding

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        binding = com.thinsia.ubivault.databinding.RegistrationFragmentBinding.inflate(inflater, container, false)
        binding.signUpButton.onFocusChangeListener = View.OnFocusChangeListener { v, hasFocus ->
            hideKeyboardIfNecessary(hasFocus, v)
        }
        binding.firstNameField.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) validateEmptyness(binding.firstNameField, binding.firstNameLayout)
        }
        binding.lastNameField.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) validateEmptyness(binding.lastNameField, binding.lastNameLayout)
        }
        binding.cityField.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) validateEmptyness(binding.cityField, binding.cityLayout)
        }
        binding.countryField.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) validateEmptyness(binding.countryField, binding.countryLayout)
        }
        binding.emailAddressField.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) validateEmailAddress()
        }
        binding.phoneNumberField.onFocusChangeListener = View.OnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) validatePhoneNumber()
        }
        binding.ethereumAccountField.onFocusChangeListener = View.OnFocusChangeListener { v, hasFocus ->
            if (!hasFocus) validateEthereumAccount()
            hideKeyboardIfNecessary(hasFocus, v)
        }
        binding.lifecycleOwner = this
        return binding.root
    }

    private fun hideKeyboard() {
        hideKeyboardIfNecessary(true, binding.anchor)
    }

    private fun formIsValid(): Boolean {
        var allValid = validateEmptyness(binding.firstNameField, binding.firstNameLayout)
        allValid = validateEmptyness(binding.lastNameField, binding.lastNameLayout) && allValid
        allValid = validateEmptyness(binding.cityField, binding.cityLayout) && allValid
        allValid = validateEmptyness(binding.countryField, binding.countryLayout) && allValid
        allValid = validateEmailAddress() && allValid
        allValid = validateEthereumAccount() && allValid
        allValid = validatePhoneNumber() && allValid
        return allValid
    }

    private fun verificationCodeIsValid(): Boolean {
        return validateVerificationCode()
    }

    private fun showFormInvalidMessage() {
        binding.container.snack(R.string.registration_info)
    }

    private fun hideKeyboardIfNecessary(hasFocus: Boolean, v: View) {
        if (hasFocus) {
            val imm = activity?.getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager?
            imm?.hideSoftInputFromWindow(v.windowToken, 0)
        }
    }

    private fun validateEmptyness(field: TextInputEditText, layout: TextInputLayout): Boolean {
        val text = field.text
        return if (text?.isEmpty() == true) {
            layout.isErrorEnabled = true
            layout.error = layout.hint.toString() + " field cannot be empty"
            false
        } else {
            layout.error = null
            layout.isErrorEnabled = false
            true
        }
    }

    private fun validateEmailAddress(): Boolean {
        val text = binding.emailAddressField.text
        if (text?.isEmpty() == true) {
            binding.emailAddressLayout.isErrorEnabled = true
            binding.emailAddressLayout.error = "Email address field cannot be empty"
        } else if (!Patterns.EMAIL_ADDRESS.matcher(text?.toString()).matches()) {
            binding.emailAddressLayout.isErrorEnabled = true
            binding.emailAddressLayout.error = "Not a valid email address"
        } else {
            binding.emailAddressLayout.error = null
            binding.emailAddressLayout.isErrorEnabled = false
            return true
        }
        return false
    }

    private fun validatePhoneNumber(): Boolean {
        val text = binding.phoneNumberField.text
        if (text?.isEmpty() == true) {
            binding.phoneNumberLayout.isErrorEnabled = true
            binding.phoneNumberLayout.error = "Phone number field cannot be empty"
        } else if (!Patterns.PHONE.matcher(text?.toString()).matches()) {
            binding.phoneNumberLayout.isErrorEnabled = true
            binding.phoneNumberLayout.error = "Not a valid phone number"
        } else {
            binding.phoneNumberLayout.error = null
            binding.phoneNumberLayout.isErrorEnabled = false
            return true
        }
        return false
    }

    private fun validateEthereumAccount(): Boolean {
        val text = binding.ethereumAccountField.text
        if (text?.isEmpty() == true) {
            binding.ethereumAccountLayout.isErrorEnabled = true
            binding.ethereumAccountLayout.error = "Ethereum account field cannot be empty"
        } else if (!ETH_ACCOUNT_PATTERN.matcher(text?.toString()).matches()) {
            binding.ethereumAccountLayout.isErrorEnabled = true
            binding.ethereumAccountLayout.error = "Not a valid Ethereum account number"
        } else {
            binding.ethereumAccountLayout.error = null
            binding.ethereumAccountLayout.isErrorEnabled = false
            return true
        }
        return false
    }

    private fun validateVerificationCode(): Boolean {
        val text = binding.verificationCodeField.text
        if (text?.isEmpty() == true) {
            binding.verificationCodeLayout.isErrorEnabled = true
            binding.verificationCodeLayout.error = "Verification code field cannot be empty"
        } else if (!"^[0-9]{6}$".toPattern().matcher(text?.toString()).matches()) {
            binding.verificationCodeLayout.isErrorEnabled = true
            binding.verificationCodeLayout.error = "Not a valid verification code"
        } else {
            binding.verificationCodeLayout.error = null
            binding.verificationCodeLayout.isErrorEnabled = false
            return true
        }
        return false
    }

    private fun validatePhoneNumberWithSms() {
        PhoneAuthProvider.getInstance().verifyPhoneNumber(
            binding.phoneNumberField.text.toString(),      // Phone number to verify
            60,                                            // Timeout duration
            TimeUnit.SECONDS,                              // Unit of timeout
            activity as Activity,                          // Activity (for callback binding)
            object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                override fun onVerificationCompleted(credential: PhoneAuthCredential?) {
                    // This callback will be invoked in two situations:
                    // 1 - Instant verification. In some cases the phone number can be instantly
                    //     verified without needing to send or enter a verification code.
                    // 2 - Auto-retrieval. On some devices Google Play services can automatically
                    //     detect the incoming verification SMS and perform verification without
                    //     user action.
                    if (credential != null) {
                        Log.d(TAG, "onVerificationCompleted:$credential")
                        signInWithPhoneAuthCredential(credential)
                    }
                }

                override fun onVerificationFailed(e: FirebaseException?) {
                    // This callback is invoked in an invalid request for verification is made,
                    // for instance if the the phone number format is not valid.
                    Log.w(TAG, "onVerificationFailed", e)
                    viewModel.onVerificationFailed()
                }

                override fun onCodeSent(verificationId: String?, token: PhoneAuthProvider.ForceResendingToken?) {
                    // The SMS verification code has been sent to the provided phone number, we
                    // now need to ask the user to enter the code and then construct a credential
                    // by combining the code with a verification ID.
                    Log.d(TAG, "onCodeSent:$verificationId")
                    viewModel.onCodeSent(verificationId)
                }
            }
        )
    }

    private fun verifyCode() {
        signInWithPhoneAuthCredential(PhoneAuthProvider.getCredential(viewModel.verificationId.get()!!, viewModel.verificationCode.get()!!))
    }

    private fun signInWithPhoneAuthCredential(credential: PhoneAuthCredential) {
        FirebaseAuth.getInstance().signInWithCredential(credential)
            .addOnCompleteListener(activity as Activity) { task ->
                if (task.isSuccessful) {
                    // Sign in success, update UI with the signed-in user's information
                    Log.d(TAG, "signInWithCredential:success")

                    val user = task.result?.user
                    viewModel.onFirebaseSignInSuccess()
                } else {
                    // Sign in failed, display a message and update the UI
                    Log.w(TAG, "signInWithCredential:failure", task.exception)
                    if (task.exception is FirebaseAuthInvalidCredentialsException) {
                        // The verification code entered was invalid
                        viewModel.onFirebaseSignInFailure()
                    }
                }
            }
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(RegistrationViewModel::class.java)

        // Register our ViewModel event handlers
        viewModel.registrationSuccess.observe(this, EventObserver { ethereumAccountHash ->
            findNavController().navigate(RegistrationFragmentDirections.actionRegistrationFragmentToRegistrationSuccessFragment(ethereumAccountHash))
        })

        viewModel.registrationError.observe(this, EventObserver {
            findNavController().navigate(R.id.action_registrationFragment_to_registrationErrorFragment)
        })

        viewModel.hideKeyboard.observe(this, EventObserver {
            hideKeyboard()
        })

        viewModel.validateForm.observe(this, EventObserver {
            if (formIsValid() && FirebaseAuth.getInstance().currentUser == null) {
                viewModel.onLoadingStarted()
                validatePhoneNumberWithSms()
            } else if (formIsValid() && FirebaseAuth.getInstance().currentUser != null) {
                // We've already validated our phone number via SMS so we can register the citizen immediately
                viewModel.onRegisterCitizen()
            } else {
                showFormInvalidMessage()
            }
        })

        viewModel.validateVerificationCode.observe(this, EventObserver {
            if (verificationCodeIsValid()) {
                viewModel.onLoadingStarted()
                verifyCode()
            } else {
                showFormInvalidMessage()
            }
        })

        binding.viewModel = viewModel
    }

}

private val TAG = RegistrationFragment::class.java.simpleName
