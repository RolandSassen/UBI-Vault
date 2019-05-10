package com.thinsia.ubivault.api

import com.jakewharton.retrofit2.adapter.kotlin.coroutines.experimental.CoroutineCallAdapterFactory
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Retrofit

object CitizensRemoteDataStore {

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("http://13.93.94.225:3000/")
        .addCallAdapterFactory(CoroutineCallAdapterFactory())
        .build()

    private val citizensService: CitizensService = retrofit.create(CitizensService::class.java)

    suspend fun registerCitizenAsync(account: String, phoneNumber: String): Deferred<RegisterCitizenResponse> {
        return withContext(Dispatchers.IO) {
            citizensService.registerCitizenAsync(RegisterCitizenRequest(account, phoneNumber))
        }
    }

    suspend fun getCitizenAsync(account: String): Deferred<GetCitizenResponse> {
        return withContext(Dispatchers.IO) {
            citizensService.getCitizenAsync(AccountRequest(account))
        }
    }

    suspend fun checkCitizenAsync(account: String): Deferred<CheckCitizenResponse> {
        return withContext(Dispatchers.IO) {
            citizensService.checkCitizenAsync(AccountRequest(account))
        }
    }

}
