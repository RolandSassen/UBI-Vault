package com.thinsia.ubivault.api

import com.jakewharton.retrofit2.adapter.kotlin.coroutines.CoroutineCallAdapterFactory
import com.thinsia.ubivault.BuildConfig
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object CitizensRemoteDataStore {

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.BASE_URL)
        .client(OkHttpClient.Builder()
            .connectTimeout(10L, TimeUnit.SECONDS)
            .callTimeout(60L, TimeUnit.SECONDS)
            .readTimeout(60L, TimeUnit.SECONDS)
            .writeTimeout(60L, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().apply { level =  HttpLoggingInterceptor.Level.BODY})
            .build()
        )
        .addConverterFactory(GsonConverterFactory.create())
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
            citizensService.getCitizenAsync(account)
        }
    }

    suspend fun checkCitizenAsync(account: String): Deferred<CheckCitizenResponse> {
        return withContext(Dispatchers.IO) {
            citizensService.checkCitizenAsync(account)
        }
    }

}
