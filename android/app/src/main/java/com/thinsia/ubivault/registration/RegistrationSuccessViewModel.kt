package com.thinsia.ubivault.registration

import android.view.View
import androidx.lifecycle.ViewModel
import androidx.navigation.findNavController
import com.thinsia.ubivault.R

class RegistrationSuccessViewModel : ViewModel() {

    val submitClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_registrationSuccessFragment_to_overviewFragment)
    }

}
