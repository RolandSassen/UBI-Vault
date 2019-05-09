package com.thinsia.ubivault.registration

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProviders

class RegistrationErrorFragment : Fragment() {

    companion object {
        fun newInstance() = RegistrationErrorFragment()
    }

    private lateinit var viewModel: RegistrationErrorViewModel

    private lateinit var binding: com.thinsia.ubivault.databinding.RegistrationErrorFragmentBinding

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        binding = com.thinsia.ubivault.databinding.RegistrationErrorFragmentBinding.inflate(inflater, container, false)
        binding.lifecycleOwner = this
        return binding.root
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(RegistrationErrorViewModel::class.java)
        binding.viewModel = viewModel
    }

}
