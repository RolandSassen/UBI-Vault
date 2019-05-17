package com.thinsia.ubivault.registration

import android.view.View
import androidx.lifecycle.ViewModel
import androidx.navigation.findNavController
import com.thinsia.ubivault.R

class RegistrationErrorViewModel : ViewModel() {

    val finishClickListener = View.OnClickListener { view ->
        view.findNavController().navigate(R.id.action_registrationErrorFragment_to_overviewFragment)
    }

    val tryAgainClickListener = View.OnClickListener { view ->
        view.findNavController().popBackStack()
    }

}
