package com.thinsia.ubivault.registration

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProviders

class RegistrationSuccessFragment : Fragment() {

    companion object {
        fun newInstance() = RegistrationSuccessFragment()
    }

    private lateinit var viewModel: RegistrationSuccessViewModel

    private lateinit var binding: com.thinsia.ubivault.databinding.RegistrationSuccessFragmentBinding

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        binding = com.thinsia.ubivault.databinding.RegistrationSuccessFragmentBinding.inflate(inflater, container, false)
        binding.lifecycleOwner = this
        return binding.root
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(RegistrationSuccessViewModel::class.java)
        binding.viewModel = viewModel
    }

}
