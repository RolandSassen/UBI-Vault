package com.thinsia.ubivault.registration

interface RegistrationFormValidator {

    fun formIsValid(): Boolean
    fun showFormInvalidMessage()
    fun hideKeyboard()

}