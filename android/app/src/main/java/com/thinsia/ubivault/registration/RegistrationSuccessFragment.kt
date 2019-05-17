package com.thinsia.ubivault.registration

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProviders
import androidx.navigation.fragment.navArgs
import com.thinsia.ubivault.domain.Account
import com.thinsia.ubivault.repository.PreferencesRepository

class RegistrationSuccessFragment : Fragment() {

    val args: RegistrationSuccessFragmentArgs by navArgs()

    companion object {
        fun newInstance() = RegistrationSuccessFragment()
    }

    private lateinit var viewModel: RegistrationSuccessViewModel

    private lateinit var binding: com.thinsia.ubivault.databinding.RegistrationSuccessFragmentBinding

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        PreferencesRepository.saveAccount(Account(args.account))
        binding = com.thinsia.ubivault.databinding.RegistrationSuccessFragmentBinding.inflate(inflater, container, false)
        binding.lifecycleOwner = viewLifecycleOwner
        return binding.root
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProviders.of(this).get(RegistrationSuccessViewModel::class.java)
        binding.viewModel = viewModel
    }

}
