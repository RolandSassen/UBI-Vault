package com.thinsia.ubivault.overview

import android.view.View
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Transformations
import androidx.lifecycle.ViewModel
import androidx.navigation.findNavController
import com.thinsia.ubivault.R
import com.thinsia.ubivault.domain.Account

class OverviewViewModel : ViewModel() {

    val registrationClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_overviewFragment_to_registrationFragment)
    }

    val myProfileClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_overviewFragment_to_profileFragment)
    }

    val myIncomeClickListener = View.OnClickListener { view ->
//        view.findNavController().navigate(R.id.action_overviewFragment_to_myIncomeFragment)
    }

    val moreInfoClickListener = View.OnClickListener { view ->
//        view.findNavController().navigate(R.id.action_overviewFragment_to_informationFragment)
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
