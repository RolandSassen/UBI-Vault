package com.thinsia.ubivault.api

import kotlinx.coroutines.Deferred
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface CitizensService {

    @GET("/checkCitizen")
    fun checkCitizenAsync(@Body accountRequest: AccountRequest): Deferred<CheckCitizenResponse>

    @GET("/getCitizen")
    fun getCitizenAsync(@Body accountRequest: AccountRequest): Deferred<GetCitizenResponse>

    @POST("/registerCitizen")
    fun registerCitizenAsync(@Body registerCitizenRequest: RegisterCitizenRequest): Deferred<RegisterCitizenResponse>

}

data class AccountRequest(
    val account: String
)

data class CheckCitizenResponse(
    val registered: Boolean
)

data class GetCitizenResponse(
    val balance: Int,
    val basicIncome: Int,
    val lastClaimed: Long,
    val expectedPaymentAtTime: Long
)

data class RegisterCitizenRequest(
    val account: String,
    val phonenumber: String
)

data class RegisterCitizenResponse(
    var error: String? = null,
    var receipt: RegistrationReceipt? = null
)

data class RegistrationReceipt(
    val blockHash: String,
    val blockNumber: String,
    val transactionHash: String,
    val transactionIndex: Int
)
