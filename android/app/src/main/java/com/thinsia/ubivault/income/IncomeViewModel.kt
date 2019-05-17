package com.thinsia.ubivault.income

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thinsia.ubivault.api.CitizensRemoteDataStore
import com.thinsia.ubivault.domain.Income
import com.thinsia.ubivault.repository.PreferencesRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

private const val TAG = "IncomeViewModel"

class IncomeViewModel : ViewModel() {

    private val _income = MutableLiveData<Income>()
    val income: LiveData<Income>
        get() = _income

    init {
        PreferencesRepository.getProfile()?.let { profile ->
            viewModelScope.launch {
                val response = try {
                    CitizensRemoteDataStore.getCitizenAsync(profile.ethereumAccount!!.hash).await()
                } catch (e: Exception) {
                    Log.e(TAG, "Error getting citizen", e)
                    null
                }

                _income.value = Income(
                    balance = response?.balance.toAmount(),
                    basicIncome = response?.basicIncome.toAmount(),
                    lastClaimed = response?.lastClaimed.toDisplayDate(),
                    expectedPaymentAtTime = response?.expectedPaymentAtTime.toDisplayDate()
                )
            }
        }
    }

}

private fun Long?.toDisplayDate(): String? = if (this != null) {
    SimpleDateFormat("EEEE d MMMM yyyy HH:mm", Locale.getDefault()).format(Date(this * 1000L))
} else {
    "(Unknown)"
}

private fun Int?.toAmount(): String? {
    return if (this == null) {
        "(Unknown)"
    } else {
        val amount = this.toDouble() / 100.0f
        val amountFormatted = amount.format(2)
        "\$$amountFormatted"
    }
}

fun Double.format(digits: Int): String = java.lang.String.format("%.${digits}f", this)
