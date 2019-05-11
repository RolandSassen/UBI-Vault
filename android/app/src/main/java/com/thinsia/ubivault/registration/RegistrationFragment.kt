package com.thinsia.ubivault.registration

import android.content.Context.INPUT_METHOD_SERVICE
import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProviders
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.thinsia.ubivault.R
import com.thinsia.ubivault.util.action
import com.thinsia.ubivault.util.snack


class RegistrationFragment : Fragment(), RegistrationFormValidator {
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

    override fun formIsValid(): Boolean {
        var allValid = validateEmptyness(binding.firstNameField, binding.firstNameLayout)
        allValid = validateEmptyness(binding.lastNameField, binding.lastNameLayout) && allValid
        allValid = validateEmptyness(binding.cityField, binding.cityLayout) && allValid
        allValid = validateEmptyness(binding.countryField, binding.countryLayout) && allValid
        allValid = validateEmailAddress() && allValid
        allValid = validateEthereumAccount() && allValid
        allValid = validatePhoneNumber() && allValid
        return allValid
    }

    override fun showFormInvalidMessage() {
        binding.container.snack(R.string.registration_form_invalid_message, Snackbar.LENGTH_INDEFINITE) {
            action("OK") { }
        }
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

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(RegistrationViewModel::class.java)
        viewModel.validator = this
        binding.viewModel = viewModel
    }

}
