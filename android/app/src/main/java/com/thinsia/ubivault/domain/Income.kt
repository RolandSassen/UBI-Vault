package com.thinsia.ubivault.domain

data class Income(
    var balance: String? = null,
    var basicIncome: String? = null,
    var lastClaimed: String? = null,
    var expectedPaymentAtTime: String? = null
)