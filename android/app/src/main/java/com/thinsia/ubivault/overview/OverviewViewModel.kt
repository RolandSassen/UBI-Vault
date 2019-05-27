package com.thinsia.ubivault.overview

import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Transformations
import androidx.lifecycle.ViewModel
import androidx.navigation.findNavController
import com.thinsia.ubivault.R
import com.thinsia.ubivault.domain.Account
import com.thinsia.ubivault.util.Event

class OverviewViewModel : ViewModel() {

    private val _showInfo = MutableLiveData<Event<Unit>>()
    val showInfo : LiveData<Event<Unit>>
        get() = _showInfo

    val registrationClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_overviewFragment_to_registrationFragment)
    }

    val myProfileClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_overviewFragment_to_profileFragment)
    }

    val myIncomeClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_overviewFragment_to_incomeFragment)
    }

    val moreInfoClickListener = View.OnClickListener { view ->
        _showInfo.value = Event(Unit)
    }

    private val account = MutableLiveData<Account>()

    fun setAccount(newAccount: Account) {
        account.value = newAccount
    }

    fun getAccount(): LiveData<Account> {
        return account
    }

    fun getAccountPresent(): LiveData<Boolean> {
        return Transformations.map(account) { account -> account.hash.isNotBlank() }
    }

}
