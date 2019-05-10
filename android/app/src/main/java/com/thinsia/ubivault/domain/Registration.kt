package com.thinsia.ubivault.domain

data class Registration(
    var firstName: String? = null,
    var lastName: String? = null,
    var city: String? = null,
    var country: String? = null,
    var email: String? = null,
    var ethereumAccount: Account? = null,
    var phoneNumber: String? = null
)